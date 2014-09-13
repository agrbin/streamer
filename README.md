streamer
========

Stream music synchronised. 

The Real Problem
================

How can below algorithm be used to synchronise the music? Didn't we just need
to synchronise clocks and then play the music at the same time from all
devices?

The problem is output latency. When application schedules the sound to be
played on speakers, various buffers inside the music card driver and music card
itself will cause output latency, eg. sound will be played with some delay.
This delay can be noticeable.

Speed of sound will also add some latency. For every 3.3 meters there will be 1
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

Analogy to the riddle problem given below is as follows:

* message times are TCP/IP network message times,
* time to climb up the lighthouse is output latency,
* blinking the light means moving the membrane of the speaker,
* time to go down to the bottom of the lighthouse is input latency,
* if two sounds are played at the same time it may be hard to detect them
  precisely.

Algorithm
=========

Let's start with a riddle that coresponds to the problem we are trying to
solve.

The riddle
----------

There are 3 lighthouses on an island each employing a keeper. Lighthouse keeper
can be located on the bottom or on the top of the building. When located on the
bottom, keeper can look at the clock installed on the wall or exchange messages
with us using a currier. Message speeds are different every time, but each
message will be delivered under an hour. Clocks are precise, but they are not
synchronised. When located on the top, keeper can spot the blink from other
lighthouses or blink with it's own light. It takes time to do the stairs up or
down and that time is constant for each lighthouse. These times may be
different for each lighthouse, and none of those 6 values are greater than 1
hour. When one lighthouse blinks the light, it drains whole island's energy
sources for 2 hours and no one else can blink.

We and our precise clock are located far away from the island and we can't
see the lights. Can we communicate with keepers in order to be able to blink
all lights at once? Energy will then be splitted in thirds and whole island's
population will have a party.

Easier subproblems
------------------

* message times are constant and keeper can fall down instantly
* message times are constant, no energy problems
* message times are constant
* communication chanel is symmetric (send and recieve times are equal)

Solution
--------

Firstly, let's try to solve the puzzle assuming that message times are
constant and that going from top to bottom takes no time (eg. if keeper can
fall down and still function).

In this scenario a keeper can measure it's own up time because he can write
down the clock value at the bottom, climb up, fall down and see the clock
difference. Each keeper can then send us a message with theirs up time. We 
can now choose a fixed time in future and send a light request to each
lighthouse at the fixed time minus its up time. Lights will be turned on at the
fixed time delayed by message time.

    light1 = X - t(up_1) + t(message) + t(up_1) = X + t(message)
    light2 = X - t(up_2) + t(message) + t(up_2) = X + t(message)
    light3 = X - t(up_3) + t(message) + t(up_3) = X + t(message)

What if down time exists, but message times are still constant? Note that if we
could calculate **differences between up times** of all pairs of lighthouses, we
could find a solution. Having the:

    t(up_12) = t(up_2) - t(up_1),
    t(up_13) = t(up_3) - t(up_1),

We can light up all lights by fixing the constant time in future and sending
light request to first lighthouse at that moment. Second request will be sent
at the fixed time decreased by difference of second's up time and first's up
time. Third request similarly. Lights will then be turned on in:

    light(1) = X + t(message) + t(up_1)
    light(2) = X - t(up_12) + t(message) + t(up_2)
           = X - (t(up_2) - t(up_1)) + t(message) + t(up_2)
           = X + t(up_1) + t(message)
    light(3) = ...

Now, how to obtain the differences? In order to obtain differences between
first two lighthouses we can send the third keeper to the top of his building
and tell him to go down and write the time when he sees the light from other
twos. Then, we can send first request at X, and second request at X + 24. This
will bring up first two lights in:

    light(1) = X + t(message) + t(up_1)
    light(2) = X + 24 + t(message) + t(up_2)

And third keeper will note the following times:

    saw_light(1) = X + t(message) + t(up_1) + t(down_3)
    saw_light(2) = X + 24 + t(message) + t(up_2) + t(down_3)

While clock from third keeper may not be synchronised with any other clock, we
know that his clock is precise and that he can precisely measure an interval of
time. By subtracting those two times, we have:

    saw_light(2) - saw_light(1) = X + t(message) + t(up_2) + t(down_3) -
                                  X + 2 + t(message) + t(up_1) + t(down_3)
                                = t(up_2) - t(up_1) - 24

Which is the difference between up times of first two lighthouses decreased by
a constant. This value is then sent tu us. In next two iterations we can obtain
other differences as well. This solves the problem when message time is
constant.

Note.

Solution without 24 hours delay would also suffice if there is no energy
constraint. On the other hand, 24 hours is enough time for keeper to go up and
down between the blinks. Smallest possible delay that can be used to meet all
the constraints is 4 hours.

Non constant message times
--------------------------

The equations showed below are not necessary to fully understand the solution
when message times are not constant. The idea is as follows. Say that at the
beginning of the time you send messages to all keepers to change their clocks to
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

If we take a look at our clock when message was received we can calculate 
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
