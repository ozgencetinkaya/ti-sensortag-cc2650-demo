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
 * Data that is plotted on the canvas.
 */
app.dataPoints = [];

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
			hyper.log(output);*/
			if(app.findById(devices,device.address)!=-1)
			{
				hyper.log("device is already detected");
				hyper.log(device.address);
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
					//hyper.log(devices[i].address);
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

app.findById = function(source, id) 
{
  for (var i = 0; i < source.length; i++) {
	if (source[i].address === id) {
	  return i;
	}
  }
  return -1;
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
		app.connectToDevice(devices[i]);
	}
}

/**
 * Read services for a device.
 */
app.connectToDevice = function(device)
{
	app.showInfo('Connecting...');
	device.connect(
		function(device)
		{
			app.showInfo('Status: Connected - reading SensorTag services...');
			app.readServices(device);
		},
		function(errorCode)
		{
			app.showInfo('Error: Connection failed: ' + errorCode + '.');
			evothings.ble.reset();
			// This can cause an infinite loop...
			//app.connectToDevice(device);
		});
};

app.readServices = function(device)
{
	device.readServices(
		[
		app.sensortag.MOVEMENT.SERVICE // Movement service UUID.
		],
		// Function that monitors accelerometer data.
		app.startAccelerometerNotification,
		function(errorCode)
		{
			console.log('Error: Failed to read services: ' + errorCode + '.');
		});
};

/**
 * Read accelerometer data.
 */
app.startAccelerometerNotification = function(device)
{
	app.showInfo('Status: Starting accelerometer notification...');

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
			app.drawDiagram(values);
		},
		function(errorCode)
		{
			console.log('Error: enableNotification: ' + errorCode + '.');
		});
};

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

/**
 * Plot diagram of sensor values.
 * Values plotted are expected to be between -1 and 1
 * and in the form of objects with fields x, y, z.
 */
app.drawDiagram = function(values)
{
	var canvas = document.getElementById('canvas');
	var context = canvas.getContext('2d');

	// Add recent values.
	app.dataPoints.push(values);

	// Remove data points that do not fit the canvas.
	if (app.dataPoints.length > canvas.width)
	{
		app.dataPoints.splice(0, (app.dataPoints.length - canvas.width));
	}

	// Value is an accelerometer reading between -1 and 1.
	function calcDiagramY(value)
	{
		// Return Y coordinate for this value.
		var diagramY =
			((value * canvas.height) / 2)
			+ (canvas.height / 2);
		return diagramY;
	}

	function drawLine(axis, color)
	{
		context.strokeStyle = color;
		context.beginPath();
		var lastDiagramY = calcDiagramY(
			app.dataPoints[app.dataPoints.length-1][axis]);
		context.moveTo(0, lastDiagramY);
		var x = 1;
		for (var i = app.dataPoints.length - 2; i >= 0; i--)
		{
			var y = calcDiagramY(app.dataPoints[i][axis]);
			context.lineTo(x, y);
			x++;
		}
		context.stroke();
	}

	// Clear background.
	context.clearRect(0, 0, canvas.width, canvas.height);

	// Draw lines.
	drawLine('x', '#f00');
	drawLine('y', '#0f0');
	drawLine('z', '#00f');
};

// Initialize the app.
app.initialize();
