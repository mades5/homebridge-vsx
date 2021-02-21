const net = require('net');

var client = new net.Socket();
client.connect(8102, "192.168.1.6");

client.on('data', function (data) {
  const response = data.toString();
  if (response === 'PWR1\r\n') {
    client.write('PO\r\n');
  } else if (response === 'PWR0\r\n') {
// Reset to default
/*
    client.write('0RGB25\r');
    client.write('0RGB04\r');
    client.write('0RGB06\r');
    client.write('0RGB15\r');
    client.write('0RGB10\r');
    client.write('0RGB19\r');
    client.write('0RGB20\r');
    client.write('0RGB21\r');
    client.write('0RGB22\r');
    client.write('0RGB23\r');
    client.write('0RGB24\r');
    client.write('0RGB34\r');
    client.write('0RGB38\r');
    client.write('0RGB40\r');
    client.write('0RGB41\r');
    client.write('0RGB44\r');
    client.write('0RGB45\r');
    client.write('0RGB17\r');
    client.write('0RGB13\r');
    client.write('0RGB05\r');
    client.write('0RGB01\r');
    client.write('0RGB02\r');
    client.write('0RGB00\r');
    client.write('0RGB12\r');
    client.write('0RGB33\r');
*/
// Set new overrides
//    client.write('APPLETV1RGB15\r');
//    client.write('TVMINI1RGB04\r');

    client.write('?RGB25\r');
    client.write('?RGB04\r');
    client.write('?RGB06\r');
    client.write('?RGB15\r');
    client.write('?RGB10\r');
    client.write('?RGB19\r');
    client.write('?RGB20\r');
    client.write('?RGB21\r');
    client.write('?RGB22\r');
    client.write('?RGB23\r');
    client.write('?RGB24\r');
    client.write('?RGB34\r');
    client.write('?RGB38\r');
    client.write('?RGB40\r');
    client.write('?RGB41\r');
    client.write('?RGB44\r');
    client.write('?RGB45\r');
    client.write('?RGB17\r');
    client.write('?RGB13\r');
    client.write('?RGB05\r');
    client.write('?RGB01\r');
    client.write('?RGB02\r');
    client.write('?RGB00\r');
    client.write('?RGB12\r');
    client.write('?RGB33\r');
  } else if (response.startsWith('RGB')) {
    let inputName = '';
    let inputChannel = '';
    inputChannel = response.substr(3,2);
    inputName = response.substr(6);
    console.log('Input ' + inputChannel + ' label ' + inputName);

  } else {
    console.log(response);
  }

});
