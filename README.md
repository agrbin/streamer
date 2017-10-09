# Streamer

This prototype shows it's possible to play synchronised music on multiple
mobile phones with different hardware and unreliable network connection.

The goal of synchronisation is to be so good that human ear can't regoznie that
there are multiple sources of sound.

During the synchronisation phase, devices communicate over IP network and audio
channel - with speakers and microphones.

Assumptions made:

- devices have clocks that can measure time intervals,
- messages transmitted over network are delivered in bounded time, or not
  delivered at all,
- network channel is asymmetric,
- at least one device has a microphone with time invariant input latency
  specific to that device,
- each device has a speaker time invariant output latency specific to that
  device,
- the room with devices is small (~10m or so, so that speed of sound doesn't
  introduce significant latency)

The duration of the synchronisation phase is proportional to message delivery
success rate, number of devices, and maximum possible latency in the system.

## Demo

**Live example at <https://agrbin.github.io/streamer/>**

Open this page from more than one device including at least one device with
browser that can use your microphone.

Ensure that microphone works [using the spectogram page](https://agrbin.github.io/streamer/spectogram.html).

Turn the speakers on. What should happen is this:

- For a minute or so you should be able to hear high-freq beeps, these are
  synchronisation impulses.
- Your devices with microphones should print 'b!' on the screen, which means
  that beeps are detected.
- When clients are well synchronized, the music should start to play.
- When music starts to play the beeps will stop, but you can add more devices
  to the group by opening the same page on other device.

To see some debug information you can take a look at the internal data
structure used by server at http://agrbin-streamer.herokuapp.com.

If you managed to test this stuff and you liked it, tell me about it!

## Sync algorithm

### Why it's not easy?

What's the fuss all about? Didn't we just need to synchronise clocks and then
play the music at the same time from all devices? Clock sync is a known
problem!

Even if the clocks are perfectly sycned, there is an audio output latency that
makes things problematic.

When application schedules the sound to be played on speakers, various buffers
inside the music card driver and music card itself will cause output latency,
eg. sound will be played with some delay. This delay can be noticeable - more
than 50ms on Android phones.

Speed of sound will also add some latency. For every 0.33 meters there will be 1
ms of latency. The subjective effect of latency is as follows:

    latency (ms)
    10            no effect
    20            slight vocalizer effect, hardly noticeable 
    30            guitar sounds doubled, like there was a small sample rate.
    40            guitar sounds even more doubled. vocal is still slightly changed,
                  like reverb
    50            clearly two guitars. hard to listen. vocal is like on megaphone
    80            two music streams are clearly recognizable. sounds awful

There is also an input latency that makes it hard to measure output latency.
This is the interval of time from when microphone picks up a signal to the
actual moment when this signal can be processed in application.

### The lighthouse analogy

Let's start with a riddle that coresponds to the problem we are trying to
solve.

There are 3 lighthouses on an island each employing a keeper. Lighthouse keeper
can be located on the bottom or on the top of the lighthouse. When located on
the bottom, keeper can look at the clock installed on the wall or exchange
messages with us using a currier. Message speeds are different every time, but
each message will be delivered in under an hour, or not delivered at all. Clocks
are precise, but they are not synchronised. When located on the top, keeper can
spot the blink from other lighthouses or blink with it's own light. It takes
time to do the stairs up or down and that time is constant and specific for
each lighthouse. Downstairs time and upstairs time will not exceed 1 hour.

We and our precise clock are located far away from the island and we can't
see the lights. Can we communicate with keepers in order to be able to blink
all lights at once?

During the synchronisation phase, when one lighthouse blinks the light, other
lighthouses shouldn't blink in the next 2 hours. This constraint is added
because in the real problem with sound signals, it's harder to detect two sound
signals if they happen close to each other. We say that a blink drains the
energy of the full island.

This is not a problem after the sync is complete - when they try to blink all
at once. In the real problem, this is exactly what our end goal is - we want
music signals to be heard as only one signal.

Analogy to the real problem is as follows:

* currier message times are TCP/IP network message times,
* time to climb up the lighthouse is audio output latency,
* blinking the light means moving the membrane of the speaker,
* time to go down to the bottom of the lighthouse is audio input latency,
* if two sounds are played at the same time it may be hard to detect them
  precisely.
* 'we' are the synchronisation server that controls the devices.

### Easier subproblems

* C1: message times are constant and all equal and downstairs time is zero
* C2: message times are constant and all equal
* C3: non-conatant message times
* C4: communication chanel is symmetric (send and recieve times are equal)

#### C1

Message times are constant and all equal and downstairs time is zero.

In this scenario a keeper can measure it's own upstairs time because he can
write down the clock value at the bottom, climb up, fall down and see the clock
difference. Each keeper can then send us a message with theirs upstairs time.

Having the upstairs time, we can do the following:

    at time (-t(up_1) - t(message)), send a light request to lighthouse1
    at time (-t(up_2) - t(message)), send a light request to lighthouse2
    at time (-t(up_3) - t(message)), send a light request to lighthouse3

The lights will go off together:

    light1 = -t(up_1) - t(message) + t(message) + t(up_1) = 0
    light2 = -t(up_2) - t(message) + t(message) + t(up_2) = 0
    light3 = -t(up_3) - t(message) + t(message) + t(up_3) = 0

#### C2

Message times are constant and all equal.

Assume we have 3 lighthouses and we want to sync only the first two. We will
use the third lighthouse to help us do so. If that is possible, we can repeat
the process to sync lighthouses 2 and 3 using the lighthouse 1 as a helper.

The main idea is to calculate **differences between upstair times** of the two
lighthouses that we want to sync.

    t(up_12) = t(up_2) - t(up_1),

Having that info, we can light up the lights on first two lighthouses at the
same time. The request to the second lighthouse needs to be offseted by the
difference `t(up_12)`.

    at time (-t(message)           ) send a light request to lighthouse1
    at time (-t(message) - t(up_12)) send a light request to lighthouse2

The lights will go off together:

    light(1) = (-t(message)           ) + t(message) + t(up_1) = t(up_1)
    light(2) = (-t(message) - t(up_12)) + t(message) + t(up_2)
             = -(t(up_2) - t(up_1)) + t(up_2)
             = t(up_1)
             = light(1)

Now, how to obtain the differences? In order to obtain differences between
first two lighthouses we can send the third keeper to the top of his lighthouse
and tell him to go down and write the time when he sees the light from the
other two.

We introduce a bigger time delay that we call 'a day' that is guaranteed to be
much bigger than any upstair, downstair or message latency time. We use this to
cleanly separate the light blink from first and second lighthouse, so that
third keeper doesn't need to worry that he will miss the second blink or that
he will not recognize two blinks at the same time.

On first day we send a light request for lighthouse 1 on time X. On second day
we send a light request for lighthouse 2 on the same time of the day X.

After the blink one the second day, the third keepr knows the difference
between upstair times between the first two lighthouses. This is what the thrid
keeper observes on the top of his lighthouse:

    light(1) = X + t(message) + t(up_1)
    light(2) = X + 1day + t(message) + t(up_2)

On the bottom of his lighthouse, the third keeper can note the receiving times:

    saw_light(1) = light(1) + t(down_3) = X + t(message) + t(up_1) + t(down_3)
    saw_light(2) = light(2) + t(down_3) = X + 1day + t(message) + t(up_2) + t(down_3)

While clock from third keeper may not be synchronised with any other clock, we
know that his clock is precise and that he can precisely measure an interval of
time. By subtracting those two times, we have:

    saw_light(2) - saw_light(1) = (X + t(message) + t(up_2) + t(down_3)) -
                                  (X + 1day + t(message) + t(up_1) + t(down_3))
                                = t(up_2) - t(up_1) - 1day

That means that third keepr now knows `t(up_12)`. He can send us this value in
a message and we can use it to sync the first two lighthouses.

#### C3

TODO(agrbin): This section is really too hard to follow.. Refactor the text.

The equations shown below are not necessary to fully understand the solution
when message times are not constant. The idea is as follows. Say that at the
beginning of the time we send messages to all keepers to change their clocks to
zero (eg. to read the clock in future by subtracting the moment when they've
received this first message).

Now all clocks in system are synchronised with maximum error of 1 hour. These
errors are not known, but they are fixed for each lighthouse. If we now issue
light requests in form of "when your time is X, climb and blink the light", and
if we are sure that request will be received in time, error between the clocks
can be viewed simply as an addition to climb time!

More formally (TLDR;), having the precise clocks that are not synced, we can
write offset for each clock against ours:

    clock(1) = clock(ours) + offset(1)
    clock(2) = clock(ours) + offset(2)
    clock(3) = clock(ours) + offset(3)

If we send a synchronisation message to a keeper asking what is his time, we
will get an answer that is shifted by a message return time - which is unknown
but bounded. If return message traveled exactly 1 hour then the current time at
lighthouse will be received time increased by 1 hour, and if return message came
instantly then received time will be correct.

If we take a look at our clock when message was received, we can calculate
difference between that value and written remote time. In that moment, remote
time written inside the message will be current remote time subtracted by
return message time.

    delta(j) = clock(ours) - (clock(j) - t(sync_return_message))

We can store that delta to later estimate possible remote time range:

    clock(j) = clock(ours) - delta(j) + t(sync_return_message)
             = clock(ours) - delta(j) + [0, 1]

When delta is once measured we can transform local time to interval of possible
remote times and vice versa:

    remote_time(j)(local_time) = [local_time - delta(j), local_time - delta(j) + 1]
    local_time(j)(remote_time) = [remote_time + delta(j) - 1, remote_time + delta(j)]

If we want to send a message that will arive at destination before some fixed
remote time X, we need to send it before

    X + delta(j) - 1 - t(message) >
    X + delta(j) - 2,
    
because t(message) < 1. We can now send messages with instruction on envelope
(open at your time X).

Denote our local time by T. We can send two messages that will be opened at
first two lighthouses in same local times and in next two hours by our time.
We will denote on envelope "open at your time X(j)" where

    X(1) = T - delta(1) + 2
    X(2) = T - delta(2) + 2

This is upper bound of possible remote times for current local time increased
by 1 hour. If message says to blink the light, the light will be blinked in
next three hours in our time. We can express the exact moment ussing the time
offset. `light(j)` is given in our local time.

    light(j) = T - delta(j) + 2 + t(up_j) - offset(j)
             = T - (-offset(j) + t(sync_return_message)) + 2 + t(up_j) - offset(j)
             = T + offset(j) - t(sync_return_message) + 2 + t(up_j) - offset(j)
             = T - t(sync_return_message_j) + 2 + t(up_j)
             < T + 3
             
Third keeper will observe difference in time between the two blinks regardless
of his clock offset against ours and time to go down the stairs. If we add a
delay between the blinks in order not to drain the energy, third keeper can
send us experienced delay between the blinks from which we can subtract the
added delay. Time interval in message from third keeper will be:

    saw_light(2) - saw_light(1)
      = light(2) + offset(3) + t(down_3) - (light(1) + offset(3) + t(down_3)
      = light(2) - light(1)
      = (T - t(sync_return_message_2) + 2 + t(up_2)) - (T - t(sync_return_message_1) + 2 + t(up_1))
      = -t(sync_return_message_2) + t(up_2) + t(sync_return_message_1) - t(up_1))
      = t(sync_return_message_1) - t(sync_return_message_2) + t(up_2) - t(up_1)
      = t(effective_up_12)

Although we can't determine `t(sync_return_message)` or `t(up)`, the third
keeper sent us the exact time difference between the two blinks. We can now
delay the first light by this value in order to synchronize first two lights.
Third light can be synchronised by one of the other keepers as a watcher.

Note that if message times are symmetric for sending and receiving to one
lighthouse, we can measure the return message time by dividing round trip time
by two. This would gave us opportunity to determine `t(up_2) - t(up_1)` just
like when message times where constant. In that scenario, clocks would also be
easily synchronised.

## Beep detection

### The problem

In the algorithm described above if the lighthouse keeper wants to turn on the
light he or she firstly must to climb the stairs and then blink the light. In
order for this information to be coupled with local time of lighthouse
receiver, its keeper needs to spot the flash and then take the stairs down and
write it down against the clock.

In audio processing, we can schedule a signal to be played on speakers at
specific future time, but this signal will be emitted into air only after a
constant output latency. Likewise, receiving application can inspect the sound
spectrum or waveform of a sound that appeared in communication channel before
some constant input latency which is unknown but constant.

Having the algorithm that is robust to input/output latency makes the design of
signal generator and detector easier in such way that if detector would make
another constant latency in detection of a signal, that latency wouldn't
interfere.

The only constraint on signal generator/detector system is thus the following:

* If generator emits two signals at specific remote times, detector must report
local times that have the same difference as remote ones. 

The constraint was used directly to test various solutions in such way that
signal generator was instructed to emit signals at regular time intervals T,
       that are significantly greater than expected error in system. Output
       from detector is always subtracted from previous output to get the
       detected time interval. If there was a false negative the next detected
       interval would be significantly greater than expected error and then we
       would subtract known T from it until we have expected value. Those error
       values are in the end statistically processed in order to determine the
       system under test that performs better than others.

Additional requirements for the system is that there are no false positives
detected and robustness to noise. False negative is less expensive from false
positive because it would just prolong the synchronization which is iterative
process while false positive will yield wrong results. Also, short signal
duration is better as it means that sound would not be as clobbered as much
during the synchronization. 

### Implementation

We experimented with three types of signal generators:

* Constant frequency tone
* Variable frequency tone
* Multiple constant/variable tones

And tried the following detection methods:

* Watch for anomalies in only one frequency in the spectrum that corresponds to
  signal frequency.
* Watch for anomalies in one frequency, but don't report signal detection if
  surrounding frequency image also changes.
* Construct a signal as a linear sweep in frequency and then find the loudest
  frequencies in spectrum window where beep appears. Plot those frequencies
  against time, fit a line and then determine where the beep probably started.
* With every iteration push loudest frequency in signal frequency window to
  queue. If queue forms a line with expected slope based on signal
  construction, determine when the signal probably started based on each sample
  in queue.
* Convolute audio input with reversed signal that is used in generator
  (cross-corelation). Watch for strong impulses in such convoluted output.

Although it seemed that last option would work best, we ended up using queue
option due to good performance in experimental tests.

Source code is visible in `client/queuebeepdetector.js`.

In silence, on 45 samples, detector made no mistakes and time intervals between
reported signals are averaged to 0.0290 ms with standard deviation of 3.005 ms.

