#!/usr/bin/env node

var amqp = require('amqplib/callback_api');

var kitchens = {
  Kitchen1: ['Italian'],
  Kitchen2: ['Japanese', 'Chinese'],
  Kitchen3: ['Japanese', 'Thai', 'Indian'],
  Kitchen4: ['Italian', 'Japanese', 'Chinese', 'Thai', 'Indian'],
};

amqp.connect('amqp://localhost', function (error0, connection) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function (error1, channel) {
    if (error1) {
      throw error1;
    }
    var exchange = 'food_exchange';

    channel.assertExchange(exchange, 'direct', {
      durable: true,
    });

    Object.keys(kitchens).forEach(function (kitchenName) {
      var routingKeys = kitchens[kitchenName];
      var queueName = kitchenName;

      channel.assertQueue(queueName, {
        durable: true,
      });

      routingKeys.forEach(function (routingKey) {
        channel.bindQueue(queueName, exchange, routingKey);
      });

      console.log(' [*] Waiting for %s orders in %s.', routingKeys, queueName);

      channel.consume(
        queueName,
        function (msg) {
          console.log(
            " [x] %s received '%s' order: %s",
            queueName,
            msg.fields.routingKey,
            msg.content.toString()
          );

          // Simulate processing time
          setTimeout(function () {
            console.log(' [x] Done');
            channel.ack(msg);
          }, 1000);
        },
        {
          noAck: false,
        }
      );
    });

    // var queue = 'order_queue';
    // channel.assertQueue(queue, {
    //   durable: true,
    // });
    // channel.prefetch(1);
    // console.log(' [*] Waiting for messages in %s. To exit press CTRL+C', queue);
    // channel.consume(
    //   queue,
    //   function (msg) {
    //     var secs = msg.content.toString().split('.').length - 1;
    //     console.log(' [x] Received');
    //     console.log(JSON.parse(msg.content));

    //     setTimeout(function () {
    //       console.log(' [x] Done');
    //       channel.ack(msg);
    //     }, secs * 1000);
    //   },
    //   {
    //     noAck: false,
    //   }
    // );
  });
});
