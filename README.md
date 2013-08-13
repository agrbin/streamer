streamer
========

Stream music synchronized. 

Live example on http://agrbin.github.io/streamer/ using nodejs hosting from http://nodejitsu.com!

Tested on Chrome and Safari.

ok, what is this.
-----------------

Every new client will be synchronized with server clock using scheme similar to NTP implemented
over WebSockets. If the network connection of the client is stable enough this process will
succeed.

After synchronization server will start to send URLs of mp3 fragments and timestamps at which those
fragments should be scheduled. Client will schedule fragments using WebAudio and play them
without any gaps and clicks!

As a result one can easily setup and listen to synced Bethoveen's 5th played from various laptops,
phones, tablets, microwave ovens, ..

