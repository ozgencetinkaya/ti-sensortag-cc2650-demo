// JavaScript code for the TI SensorTag Demo app.

/**
 * Object that holds application data and functions.
 */
var app = {};

/**
	*Object that holds found devices.
	*
*/
var devices = []; 
/**
	*Object that holds connected devices.
	*
*/
var connectedDevicesCheck = [];
/**
 * Data that is plotted on the canvas.
 */
app.dataPoints = [];
/**
 * Creating 2d array.
 */
app.dataPoints[0] = [];
app.dataPoints[1] = [];
app.dataPoints[2] = [];

app.UserColors = ['red','green','blue'];
/**
 * Timeout (ms) after which a message is shown if the SensorTag wasn't found.
 */
app.CONNECT_TIMEOUT = 3000;

/**
 * Object that holds SensorTag UUIDs.
 */
app.sensortag = {};

// UUIDs for movement services and characteristics.
/*app.sensortag.MOVEMENT_SERVICE = 'f000aa80-0451-4000-b000-000000000000';
app.sensortag.MOVEMENT_DATA = 'f000aa81-0451-4000-b000-000000000000';
app.sensortag.MOVEMENT_CONFIG = 'f000aa82-0451-4000-b000-000000000000';
app.sensortag.MOVEMENT_PERIOD = 'f000aa83-0451-4000-b000-000000000000';
app.sensortag.MOVEMENT_NOTIFICATION = '00002902-0000-1000-8000-00805f9b34fb';*/

app.sensortag.NOTIFICATION_DESCRIPTOR = '00002902-0000-1000-8000-00805f9b34fb'

app.sensortag.DEVICEINFO_SERVICE = '0000180a-0000-1000-8000-00805f9b34fb'
app.sensortag.FIRMWARE_DATA = '00002a26-0000-1000-8000-00805f9b34fb'
app.sensortag.MODELNUMBER_DATA = '00002a24-0000-1000-8000-00805f9b34fb'

app.sensortag.TEMPERATURE = {
	SERVICE: 'f000aa00-0451-4000-b000-000000000000',
	DATA: 'f000aa01-0451-4000-b000-000000000000',
	CONFIG: 'f000aa02-0451-4000-b000-000000000000',
	// Missing in HW rev. 1.2 (FW rev. 1.5)
	PERIOD: 'f000aa03-0451-4000-b000-000000000000',
}

app.sensortag.HUMIDITY = {
	SERVICE: 'f000aa20-0451-4000-b000-000000000000',
	DATA: 'f000aa21-0451-4000-b000-000000000000',
	CONFIG: 'f000aa22-0451-4000-b000-000000000000',
	PERIOD: 'f000aa23-0451-4000-b000-000000000000',
}

app.sensortag.BAROMETER = {
	SERVICE: 'f000aa40-0451-4000-b000-000000000000',
	DATA: 'f000aa41-0451-4000-b000-000000000000',
	CONFIG: 'f000aa42-0451-4000-b000-000000000000',
	CALIBRATION: 'f000aa43-0451-4000-b000-000000000000',
	PERIOD: 'f000aa44-0451-4000-b000-000000000000',
}

app.sensortag.LUXOMETER = {
	SERVICE: 'f000aa70-0451-4000-b000-000000000000',
	DATA: 'f000aa71-0451-4000-b000-000000000000',
	CONFIG: 'f000aa72-0451-4000-b000-000000000000',
	PERIOD: 'f000aa73-0451-4000-b000-000000000000',
}

app.sensortag.MOVEMENT = {
	SERVICE: 'f000aa80-0451-4000-b000-000000000000',
	DATA: 'f000aa81-0451-4000-b000-000000000000',
	CONFIG: 'f000aa82-0451-4000-b000-000000000000',
	PERIOD: 'f000aa83-0451-4000-b000-000000000000',
}

app.sensortag.KEYPRESS = {
	SERVICE: '0000ffe0-0000-1000-8000-00805f9b34fb',
	DATA: '0000ffe1-0000-1000-8000-00805f9b34fb',
}

/**
 * Initialise the application.
 */
app.initialize = function()
{
	document.addEventListener(
		'deviceready',
		function() { evothings.scriptsLoaded(app.onDeviceReady) },
		false);

	// Called when HTML page has been loaded.
	$(document).ready( function()
	{
		// Adjust canvas size when browser resizes
		$(window).resize(app.respondCanvas);

		// Adjust the canvas size when the document has loaded.
		app.respondCanvas();
	});
};

/**
 * Adjust the canvas dimensions based on its container's dimensions.
 */
app.respondCanvas = function()
{
	var canvas = $('#canvas')
	var container = $(canvas).parent()
	canvas.attr('width', $(container).width() ) // Max width
	// Not used: canvas.attr('height', $(container).height() ) // Max height
};

app.onDeviceReady = function()
{
	app.showInfo('Activate the SensorTag and tap Start.');
};

app.showInfo = function(info)
{
	document.getElementById('info').innerHTML = info;
};

app.showDeviceStatus = function(i)
{
	var id = 'device'+i;	
	console.log(id);
	document.getElementById(id).innerHTML = devices[i].address+' '+':Connected';
}

app.clearDeviceStatus  = function()
{
	document.getElementById('device0').innerHTML = 'Not Connected';
	document.getElementById('device1').innerHTML = 'Not Connected';
	document.getElementById('device2').innerHTML = 'Not Connected';
}

app.showDeviceInfo = function(message, device_id)
{
	var id = 'device'+device_id;	
	//console.log(id);
	document.getElementById(id).innerHTML = message;
}

app.updateButtonInfo = function(message, device_id)
{
	var id = 'button'+device_id;	
	//console.log(id);
	document.getElementById(id).innerHTML = message;
}

app.writeTempValue = function(value, device_id)
{
	var id = 'temp'+device_id;	
	//console.log(id);
	document.getElementById(id).innerHTML = value;
}

app.writeAnswer = function(answer)
{
	if(keypressBuffer!=4 && !gameStopped)
	{
		console.log(questionAsked);
		if(questionAsked)
		{
			document.getElementById('answer').innerHTML = 'Selected Button is '+answer;
		}
	}
}

app.clearAnswer = function(answer)
{
	document.getElementById('answer').innerHTML = '';
}

app.updateGameStatus = function(message)
{
	document.getElementById('game_status').innerHTML = message;
}

app.showObjectDetails = function(object)
{
	var output = '';
	for (var property in object) {
		output += property + ': ' + object[property]+'; ';
	};
	console.log(output);
}

app.findById = function(source, id) 
{
  for (var i = 0; i < source.length; i++) {
	if (source[i].address === id) {
	  return i;
	}
  }
  return -1;
};

app.setBackgroundColor = function(i)
{
	console.log(app.UserColors[i]);
	document.getElementById('user').style.background = app.UserColors[i];
}

app.setBackgroundColorDefault = function()
{
	document.getElementById('user').style.background = 'black';
}

app.onStartButton = function()
{
	app.onStopButton();
	app.startScan();
	app.showInfo('Status: Scanning...');
	app.startConnectTimer();
};

app.onStopButton = function()
{
	//if(devices.length<3)
	//{
		// Stop any ongoing scan and close devices.
		app.stopConnectTimer();
		evothings.easyble.stopScan();
		evothings.easyble.closeConnectedDevices();
		app.showInfo('Status: Stopped.');
		app.clearDeviceStatus(); 
	//}
};

app.startConnectTimer = function()
{
	// If connection is not made within the timeout
	// period, an error message is shown.
	app.connectTimer = setTimeout(
		function()
		{
			app.showInfo('Status: Scanning... ' +
				'Please press the activate button on the tag.');
		},
		app.CONNECT_TIMEOUT)
}

app.stopConnectTimer = function()
{
	clearTimeout(app.connectTimer);
}

app.startScan = function()
{
	evothings.easyble.startScan(
		function(device)
		{
			// Debug point to identify device details
			/*var output = '';
			for (var property in device) {
				output += property + ': ' + device[property]+'; ';
			};
			console.log(output);*/
			if(app.findById(devices,device.address)!=-1)
			{
				console.log("device is already detected");
				console.log(device.address);
			}
			else
			{
				devices.push(device);
			}
			if(devices.length != 0)
			{
				var html_holder = 'Scanned Devices:';
				for (var i = 0; i < devices.length; i++)
				{
					var html_holder = html_holder+' '+devices[i].address+',';
					//console.log(devices[i].address);
					app.showDeviceStatus(i);
				}
				app.showInfo(html_holder);
			}
			if(devices.length>2)
			{
				evothings.easyble.stopScan();
				app.connectToDevices();
				app.stopConnectTimer();
			}
			/*
			// Connect if we have found a sensor tag.
			if (app.deviceIsSensorTag(device))
			{
				app.showInfo('Status: Device found: ' + device.name + '.');
				evothings.easyble.stopScan();
				app.connectToDevice(device);
				app.stopConnectTimer();
			}
			*/
		},
		function(errorCode)
		{
			app.showInfo('Error: startScan: ' + errorCode + '.');
		});
};

app.deviceIsSensorTag = function(device)
{
	console.log('device name: ' + device.name);
	return (device != null) &&
		(device.name != null) &&
		(device.name.indexOf('Sensor Tag') > -1 ||
			device.name.indexOf('SensorTag') > -1);
};

app.connectToDevices = function()
{
	for (var i = 0; i < devices.length; i++)
	{
		app.connectToDevice(devices[i],i);
	}
}

/**
 * Read services for a device.
 */
app.connectToDevice = function(device,i)
{
	app.showInfo('Connecting...');
	device.connect(
		function(device)
		{
			var i = app.findById(devices,device.address);
			//console.log(i);
			//console.log(devices[i].address);
			//console.log(device.address);
			app.showDeviceInfo('Connected - reading SensorTag services...',i);
			app.readServices(device,i);
		},
		function(errorCode)
		{
			app.showInfo('Error: Connection failed: ' + errorCode + '.');
			evothings.ble.reset();
			// This can cause an infinite loop...
			//app.connectToDevice(device);
		});
};

app.readServices = function(device,i)
{
	device.readServices(
		[
		//app.sensortag.MOVEMENT.SERVICE // Movement service UUID.
		app.sensortag.KEYPRESS.SERVICE // KeyPress service UUID.
		,app.sensortag.TEMPERATURE.SERVICE //Temperature service UUID.
		],
		// Function that monitors accelerometer data.
		app.startNotification,
		function(errorCode)
		{
			console.log('Error: Failed to read services: ' + errorCode + '.');
		});
};

/**
 * Read device data.
 */
app.startNotification = function(device)
{
	var id = app.findById(devices,device.address);
	app.showDeviceInfo('Starting notifications...',id);

	/*
	// Set accelerometer configuration to ON.
	// magnetometer on: 64 (1000000) (seems to not work in ST2 FW 0.89)
	// 3-axis acc. on: 56 (0111000)
	// 3-axis gyro on: 7 (0000111)
	// 3-axis acc. + 3-axis gyro on: 63 (0111111)
	// 3-axis acc. + 3-axis gyro + magnetometer on: 127 (1111111)
	device.writeCharacteristic(
		app.sensortag.MOVEMENT.CONFIG,
		new Uint8Array([56,0]),
		function()
		{
			console.log('Status: writeCharacteristic ok.');
		},
		function(errorCode)
		{
			console.log('Error: writeCharacteristic: ' + errorCode + '.');
		});

	// Set accelerometer period to 100 ms.
	device.writeCharacteristic(
		app.sensortag.MOVEMENT.PERIOD,
		new Uint8Array([10]),
		function()
		{
			console.log('Status: writeCharacteristic ok.');
		},
		function(errorCode)
		{
			console.log('Error: writeCharacteristic: ' + errorCode + '.');
		});

	// Set accelerometer notification to ON.
	device.writeDescriptor(
		app.sensortag.MOVEMENT.DATA,
		app.sensortag.NOTIFICATION_DESCRIPTOR, // Notification descriptor.
		new Uint8Array([1,0]),
		function()
		{
			console.log('Status: writeDescriptor ok.');
		},
		function(errorCode)
		{
			// This error will happen on iOS, since this descriptor is not
			// listed when requesting descriptors. On iOS you are not allowed
			// to use the configuration descriptor explicitly. It should be
			// safe to ignore this error.
			console.log('Error: writeDescriptor: ' + errorCode + '.');
		});

	// Start accelerometer notification.
	device.enableNotification(
		app.sensortag.MOVEMENT.DATA,
		function(data)
		{
			app.showInfo('Status: Data stream active - accelerometer');
			var dataArray = new Uint8Array(data);
			var values = app.getAccelerometerValues(dataArray);
			//app.drawDiagram(device,values);
		},
		function(errorCode)
		{
			console.log('Error: enableNotification: ' + errorCode + '.');
		});
	*/
	
	// Set keypress notification to ON.
	device.writeDescriptor(
		app.sensortag.KEYPRESS.DATA,
		app.sensortag.NOTIFICATION_DESCRIPTOR, // Notification descriptor.
		new Uint8Array([1,0]),
		function()
		{
			console.log('Status: Keypress writeDescriptor ok.');
		},
		function(errorCode)
		{
			// This error will happen on iOS, since this descriptor is not
			// listed when requesting descriptors. On iOS you are not allowed
			// to use the configuration descriptor explicitly. It should be
			// safe to ignore this error.
			console.log('Error: Keypress writeDescriptor: ' + errorCode + '.');
		});

	// Start keypress notification.
	device.enableNotification(
		app.sensortag.KEYPRESS.DATA,
		function(data)
		{
			app.showInfo('Status: Data stream active - keypress');
			var dataArray = new Uint8Array(data);
			var values = app.getKeyPressValues(device,dataArray);
		},
		function(errorCode)
		{
			console.log('Error: enableNotification: ' + errorCode + '.');
		});
		
	//Activate TEMPERATURE service
	device.writeCharacteristic(
		app.sensortag.TEMPERATURE.CONFIG,
		new Uint8Array([1]),
		function()
		{
			console.log('Status: TEMP writeCharacteristic CONFIG ok.');
		},
		function(errorCode)
		{
			console.log('Error: TEMP writeCharacteristic: ' + errorCode + '.');
		});

	// Set TEMPERATURE period to 100 ms.
	device.writeCharacteristic(
		app.sensortag.TEMPERATURE.PERIOD,
		new Uint8Array([100]),
		function()
		{
			console.log('Status: TEMP writeCharacteristic PERIOD ok.');
		},
		function(errorCode)
		{
			console.log('Error: TEMP writeCharacteristic: ' + errorCode + '.');
		});

	// Set TEMPERATURE notification to ON.
	device.writeDescriptor(
		app.sensortag.TEMPERATURE.DATA,
		app.sensortag.NOTIFICATION_DESCRIPTOR, // Notification descriptor.
		new Uint8Array([1,0]),
		function()
		{
			console.log('Status: TEMP writeDescriptor ok.');
		},
		function(errorCode)
		{
			// This error will happen on iOS, since this descriptor is not
			// listed when requesting descriptors. On iOS you are not allowed
			// to use the configuration descriptor explicitly. It should be
			// safe to ignore this error.
			console.log('Error: TEMP writeDescriptor: ' + errorCode + '.');
		});

	// Start TEMPERATURE notification.
	device.enableNotification(
		app.sensortag.TEMPERATURE.DATA,
		function(data)
		{
			app.showInfo('Status: Data stream active - TEMPERATURE');
			//var dataArray = new Uint8Array(data);
			//var values = app.getAccelerometerValues(dataArray);
			app.showTemp(device,data);
		},
		function(errorCode)
		{
			console.log('Error: TEMP enableNotification: ' + errorCode + '.');
		});
		
	connectedDevicesCheck.push(device);
};

var keypressBuffer = 4;
var keypressOrder = -1;

app.getKeyPressValues = function(device,data)
{
	var i = app.findById(devices,device.address);
	app.updateButtonInfo(data,i);
	//app.setBackgroundColor(i);
	//app.setBackgroundColorDefault();
	//console.log(data);
	if(keypressBuffer == 4 && data!=0)
	{
		keypressBuffer = data;
		keypressOrder = i;
	}
	if(i==answeringuser && data!=0)
	{
		app.writeAnswer(data);
		console.log(data);
		keypressBuffer = data;
		keypressOrder = i;
		answer = keypressBuffer;
	}

}
var answer=0;
var answeringuser=0;
app.clearKeyPressValues = function()
{
	keypressBuffer = 4;
	keypressOrder = -1;
	questionAsked = true;
	var timeinterval = setInterval(function(){
		if(!gameStopped)
		{			
			console.log(keypressBuffer);
			console.log(keypressOrder);
			if(keypressBuffer!=4)
			{
				answeringuser = keypressOrder;
				answer = keypressBuffer;
				keypressBuffer = 4;
				app.setBackgroundColor(answeringuser);
				app.writeAnswer(keypressBuffer);
				app.updateGameStatus('User '+answeringuser+' has right to answer...');
				//check answer;
				app.count(checkAnswer,10,0);	
				clearInterval(timeinterval);
				app.clearCount();
			}
		}
	},1000);
}

/**
 * Calculate accelerometer values from raw data for SensorTag 2.
 * @param data - an Uint8Array.
 * @return Object with fields: x, y, z.
 */
app.getAccelerometerValues = function(data)
{
	var divisors = { x: -16384.0, y: 16384.0, z: -16384.0 };

	// Calculate accelerometer values.
	var ax = evothings.util.littleEndianToInt16(data, 6) / divisors.x;
	var ay = evothings.util.littleEndianToInt16(data, 8) / divisors.y;
	var az = evothings.util.littleEndianToInt16(data, 10) / divisors.z;

	// Return result.
	return { x: ax, y: ay, z: az };
};

app.showTemp = function(device,data)
{
	var i = app.findById(devices,device.address);
	var tmp = new Uint8Array(data);
	// Calculate ambient temperature (Celsius).
	var ac = evothings.util.littleEndianToUint16(tmp, 2) / 128.0;

	// Calculate target temperature (Celsius).
	var tc = evothings.util.littleEndianToInt16(tmp, 0);
	tc = (tc >> 2) * 0.03125
	//console.log('DeviceId: '+i+'  Ambient Temp:'+ac+'  Target Temp:'+tc);
	var values = {x:tc};
	app.writeTempValue(tc,i);
	app.drawDiagram(device,values);
}

/**
 * Plot diagram of sensor values.
 * Values plotted are expected to be between -1 and 1
 * and in the form of objects with fields x, y, z.
 */
app.drawDiagram = function(device,values)
{
	var i = app.findById(devices,device.address);
	var canvasId = 'canvas'+i;
	//console.log('Canvas Id: '+canvasId);
	var canvas = document.getElementById(canvasId);
	var context = canvas.getContext('2d');

	// Add recent values.
	app.dataPoints[i].push(values);

	// Remove data points that do not fit the canvas.
	if (app.dataPoints[i].length > canvas.width)
	{
		app.dataPoints[i].splice(0, (app.dataPoints[i].length - canvas.width));
	}

	// Value is an accelerometer reading between -1 and 1.
	function calcDiagramY(value)
	{
		// Return Y coordinate for this value.
		/*var diagramY =
			((value * canvas.height) / 2)
			+ (canvas.height / 2);
		*/
		var diagramY = (canvas.height / 2) - value + 30;
		//console.log(diagramY);
		return diagramY;
	}

	function drawLine(axis, color, id)
	{
		context.strokeStyle = color;
		context.beginPath();
		var lastDiagramY = calcDiagramY(
			app.dataPoints[id][app.dataPoints[id].length-1][axis]);
		context.moveTo(0, lastDiagramY);
		var x = 1;
		for (var i = app.dataPoints[id].length - 2; i >= 0; i--)
		{
			var y = calcDiagramY(app.dataPoints[id][i][axis]);
			context.lineTo(x, y);
			x++;
		}
		context.stroke();
	}

	// Clear background.
	context.clearRect(0, 0, canvas.width, canvas.height);

	// Draw lines.
	//drawLine('x', '#f00',i);
	//drawLine('y', '#0f0',i);
	//drawLine('z', '#00f',i);
	drawLine('x', '#f00',i);
};


/*app.onGameStart = function()
{
	if(connectedDevicesCheck.length >= 0 && devices.length == connectedDevicesCheck.length)
	{
		app.setBackgroundColorDefault();
		app.updateGameStatus('All Users Connected, Game starts...');
		app.count(askQuestion,3,1); 
		//setTimeout(app.updateGameStatus('Wait for timer to finish and press a button if you would like to answer...'),3000);
		//setTimeout(app.count(app.clearKeyPressValues,2),3000);
		var interval=setInterval(function(){
			//keypressBuffer = 0;
			//keypressOrder = -1;				
			if(currentQuestion < quiz.length - 1 )
			{
				if(keypressBuffer>0 && keypressBuffer<4)
				{
					checkAnswer(keypressBuffer);
				}
				else
				{
					setTimeout(app.updateGameStatus('Please answer the question...'),2000);
				}
			}
			else
			{
				app.updateGameStatus('Game ends...');
				console.log('Game ends..');
				clearInterval(interval);					
			}
		},1000);		
	}
	else
	{
		app.updateGameStatus('Waiting for Users to Connect...');
	}
	
};
*/

var gameStopped = true;
var questionAsked = false;

app.onGameStart = function()
{
	gameStopped = false;
	if(connectedDevicesCheck.length >= 0 && devices.length == connectedDevicesCheck.length && !gameStopped)
	{
		app.setBackgroundColorDefault();
		app.updateGameStatus('All Users Connected, Game starts...');
		app.count(askQuestion,3,1); 
	}
	else
	{
		app.updateGameStatus('Waiting for Users to Connect...');
	}	
};


app.onGameStop = function()
{
	gameStopped = true;
	app.updateGameStatus('Game is stopping...');
	app.count(app.empty,2,0);
	var interval = setInterval(function(){app.updateGameStatus('Game is stopped...');clearInterval(interval);},3000);
};

app.count = function(call,time,state){
  var clock = time;
  var count_display = document.getElementById('counter');
  
  var timeinterval = setInterval(function(){
    count_display.innerHTML = clock;
	clock--;
    if(clock <0){
	  if(state==0)
	  {
		  call();
		  app.clearCount();
	  }
	  else if(state==1 && !gameStopped)
	  {
		  call();		  
		  app.clearCount();
		  app.updateGameStatus('Wait for timer to finish and press a button if you would like to answer...');
		  app.count(app.clearKeyPressValues,1,0);
	  }
	  clearInterval(timeinterval);
    }
  },1000);
}

app.clearCount = function()
{
	document.getElementById('counter').innerHTML = '';
}

//Empty function for debugging
app.empty = function()
{
	
}
// Initialize the app.
app.initialize();
