'use strict';
const AWS = require('aws-sdk');

//todo: cognito region need modify: ap-southeast-1; us-east-2
const client = new AWS.CognitoIdentityServiceProvider({
	apiVersion: '2016-04-19',
	region: 'ap-southeast-1'  // profile itritomaws & tomrd
	// region: 'us-east-2' // profile tomrd
});


exports.delamiboitems = (event, context, callback) => {
	console.log('Received event {}', JSON.stringify(event, 3));

	let consumer_Key = event.arguments.consumer_key;
	let consumer_secret = event.arguments.consumer_secret;

	console.log('Got an Invoke Request.');
	switch (event.field) {
		case 'helloWorld': {

			// callback(null, `hello: ${consumer_Key}, this is sec: ${consumer_secret}`);
			callback(null, {'test': 'response ok?', 'key': consumer_Key});
			break;
		}

		case 'delAmiboRawItems': {

			//todo: dynamodb table name need modify: AmiboTable-Dev
			let Target_table = 'AmiboTable-Dev';  // profile itritomaws

			let cognitoUsr = event.arguments.phone;

			//todo: dynamodb region need modify: ap-southeast-1; test: us-east-1
			const dynamodb = new AWS.DynamoDB({
				region: 'ap-southeast-1',
				apiVersion: '2012-08-10'
			});
			
			let mobile_sub2;
			let device_sub2;
			let device_sub2_User;
			const params5 = {
				// 'UserPoolId': 'ap-southeast-1_ntfECmrjH', //todo: userpoolID region need modify: ap-southeast-1_ntfECmrjH  profile itritomaws
				'UserPoolId': 'ap-southeast-1_5jWRLaKaW', //todo: userpoolID region need modify: ap-southeast-1_ntfECmrjH  profile tomrd
				'Filter': `phone_number=\"+${event.arguments.phone}\"` // equals
			}; //ap-southeast-1_5jWRLaKaW

			
			console.log('show params5: ', params5);

			client.listUsers(params5, (err, cogUsrData) => {

				if (err) {
					console.error('error: ' , err.message);
					callback(null, {'listUsers error msg: ': err.message, 'param5: ': params5});
					return;
				} else {
					console.log('cogUsr object: ', JSON.stringify(cogUsrData, null, 2));

					const UserExists = (cogUsrData.Users.length);
					if (UserExists > 0) {
						for (let i = 0; i < cogUsrData.Users.length; i++) {
							let cognitoUsername = cogUsrData.Users[i].Username;
							if (cognitoUsername.startsWith('device')) {
								// device_sub2 = 'Device-' + cogUsrData.Users[i].Attributes[1].Value;  //todo: 在 itritomaws
								// device_sub2_User = 'DeviceUser-' + cogUsrData.Users[i].Attributes[1].Value;    //todo: 在 itritomaws
								device_sub2 = 'Device-' + cogUsrData.Users[i].Attributes[0].Value;  //todo: 在tomrd
								device_sub2_User = 'DeviceUser-' + cogUsrData.Users[i].Attributes[0].Value;   //todo: 在tomrd
							} else {
								// mobile_sub2 = 'MobileUser-' + cogUsrData.Users[i].Attributes[1].Value;  //todo: 在 itritomaws
								mobile_sub2 = 'MobileUser-' + cogUsrData.Users[i].Attributes[0].Value;  //todo: 在tomrd
							}
						}

						// delete PK -- MobileUser- begin
						let objMobileUser;
						let itemsArray1 = []; 
						let itemsArray1_1 = [];
						let itemsArray4 = [];
						let itemsArray4_1 = [];
						{
							//delete begin: DeviceUser-XXXXXX
							{
								var params411_1 = {
									ExpressionAttributeValues: {
										":v2_1": {
											S: device_sub2_User
										},
									},
									KeyConditionExpression: "PK = :v2_1",
									TableName: Target_table
								};
								dynamodb.query(params411_1, function (err, data4_1) {
									if (err) {
										console.error('params411_1 - Unable to read item. Error JSON: ', JSON.stringify(err, null, 2));
										callback(null, {'Query Alert. User has no Amibo Device Data': event.arguments.phone, 'Error': JSON.stringify(err, null, 2)});
										return;
									} else {
										const DeviceCount_1 = data4_1.Items.length;
										console.log("QUERY DeviceUser - PK - succeeded: ", JSON.stringify(data4_1, null, 2));
										// console.log('device count: ', DeviceCount);
										console.log('Debug params411_1:', JSON.stringify(params411_1, null,2));
			
										if (DeviceCount_1 > 0 ) {
											let item4;
											let item4_1;
											let WhatINeed4;
											for (let index = 0; index < data4_1.Items.length; index++) {
												// const element = array[index];
												WhatINeed4 = data4_1.Items[index];
												// console.log(WhatINeed4.PK, WhatINeed4.SK);
												// console.log('------');
												item4 = {
													DeleteRequest: {
														Key: {
															'PK': {
																S: WhatINeed4.PK.S
															},
															'SK': {
																S: WhatINeed4.SK.S
															}
														},
													},
												};
												item4_1 = {
													Key: {
														'PK': {
															S: WhatINeed4.PK.S
														},
														'SK': {
															S: WhatINeed4.SK.S
														}
													},
													TableName: Target_table,
												};
												itemsArray4.push(item4);
												itemsArray4_1.push(item4_1);
											}
				
											itemsArray4_1.forEach(element4 => {
												// console.log(element);
												var params412_1_1 = element4;
												// console.log(params412_1);
												//deleteitem
												dynamodb.deleteItem(params412_1_1, function(err, data4_1){
													if (err) {
														console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
														callback(null, {'deleteItem Error params412_1: ': err.message});
													} else {
														// console.log("delete Device - PK - succeeded:", JSON.stringify(data4_1, null, 2));
													}
												});
											});
											callback(null, {"mobile": cognitoUsr, "device_sub": device_sub2_User, "status": 'deleted!'});
										} else 
										{
											callback(null, {'no amibo(DeviceUser) reord': 0});
										}
									}
								});
							}
							//delete end: DeviceUser-XXXXXX

							//delete begin: Device-XXXXXX
							{
								var params411 = {
									ExpressionAttributeValues: {
										":v2": {
											S: device_sub2
										},
									},
									KeyConditionExpression: "PK = :v2",
									TableName: Target_table
								};
								dynamodb.query(params411, function (err, data4) {
									if (err) {
										console.error('params411 - Unable to read item. Error JSON: ', JSON.stringify(err, null, 2));
										callback(null, {'Query Alert. User has no Amibo Device Data': event.arguments.phone, 'Error': JSON.stringify(err, null, 2)});
										return;
									} else {
										const DeviceCount = data4.Items.length;
										console.log("QUERY Device- PK - succeeded: ", JSON.stringify(data4, null, 2));
										// console.log('device count: ', DeviceCount);
										console.log('Debug params411:', JSON.stringify(params411, null,2));
				
										if (DeviceCount > 0 ) {
											let item4;
											let item4_1;
											let WhatINeed4;
											for (let index = 0; index < data4.Items.length; index++) {
												// const element = array[index];
												WhatINeed4 = data4.Items[index];
												// console.log(WhatINeed4.PK, WhatINeed4.SK);
												// console.log('------');
												item4 = {
													DeleteRequest: {
														Key: {
															'PK': {
																S: WhatINeed4.PK.S
															},
															'SK': {
																S: WhatINeed4.SK.S
															}
														},
													},
												};
												item4_1 = {
													Key: {
														'PK': {
															S: WhatINeed4.PK.S
														},
														'SK': {
															S: WhatINeed4.SK.S
														}
													},
													TableName: Target_table,
												};
												itemsArray4.push(item4);
												itemsArray4_1.push(item4_1);
											}
				
											itemsArray4_1.forEach(element4 => {
												// console.log(element);
												var params412_1 = element4;
												// console.log(params412_1);
												//deleteitem
												dynamodb.deleteItem(params412_1, function(err, data4_1){
													if (err) {
														console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
														callback(null, {'deleteItem Error params412_1: ': err.message});
													} else {
														// console.log("delete Device - PK - succeeded:", JSON.stringify(data4_1, null, 2));
													}
												});
											});
					
											// var params412 = {
											// 	RequestItems: {
											// 		'AmiboTb-Test-Tom1': itemsArray4
											// 	}
											// };
				
											// console.log(params412);
											// dynamodb.batchWriteItem(params412, function (err, data) {
											//     if (err) {
											//         console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
											//     } else {
											//         console.log("delete Device - PK - succeeded:", JSON.stringify(data, null, 2));
											//     }
											// });
											callback(null, {"mobile": cognitoUsr, "device_sub": device_sub2, "status": 'deleted!'});
										} else 
										{
											callback(null, {'no amibo(device) reord': 0});
										}
									}
								});
							}
							//delete end: Device-XXXXXX
			
							//delete begin: MobileUser-XXXXXX
							{
								var params311 = {
									ExpressionAttributeValues: {
										":v1": {
											S: mobile_sub2
										}
									},
									KeyConditionExpression: "PK = :v1",
									TableName: Target_table
								};
								dynamodb.query(params311, function (err, data2) {
									if (err) {
										console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
										callback(null, {'Query Alert. User has no amibo mobile data': event.arguments.phone, 'Error': JSON.stringify(err, null, 2)});
										return;
									} else {
										objMobileUser = Object.assign({}, data2);
										console.log("QUERY MobileUser- PK - succeeded:", JSON.stringify(data2, null, 2));
										
										const mobileUserCount = (objMobileUser.Items.length); 
										// console.log('mobileUser Count is : ' + mobileUserCount);
				
										if (mobileUserCount > 0) {
											let item2;
											let item2_1;
											let WhatINeed;
											for (let index = 0; index < objMobileUser.Items.length; index++) {
					
												// todo start
												// console.log(objTest.Items[index]);
												WhatINeed = (objMobileUser.Items[index]);
												// console.log(WhatINeed.PK, WhatINeed.SK);
												item2 = {
													DeleteRequest: {
														Key: {
															'PK': {
																S: WhatINeed.PK.S
															},
															'SK': {
																S: WhatINeed.SK.S
															}
														},
													},
												};
												item2_1 = {
													Key: {
														'PK': {
															S: WhatINeed.PK.S
														},
														'SK': {
															S: WhatINeed.SK.S
														}
													},
													TableName: Target_table, 
												};
				
												itemsArray1.push(item2);
												itemsArray1_1.push(item2_1);
												
												// todo end
											}
				
											itemsArray1_1.forEach(element1 => {
												var params312_1 = element1;
												console.log(params312_1);
												//todo: deleteitem begin
												dynamodb.deleteItem(params312_1, function(err, data1_1){
													if (err) {
														console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
														callback(null, {'deleteItem Error params312_1: ': err.message});
														return;
													} else {
														console.log("delete MobileUser - PK - succeeded:", JSON.stringify(data1_1, null, 2));
													}
												});
												//todo: deleteitem end
											});
	
											// todo: batchWriteItem -- 
											// var params312 = {
											// 	RequestItems: {
											// 		'AmiboTb-Test-Tom1': itemsArray1
											// 	}
											// };
											// dynamodb.batchWriteItem(params312, function (err, data) {
											//     if (err) {
											//         console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
											//     } else {
											//         console.log("delete MobileUser - PK - succeeded:", JSON.stringify(data, null, 2));
											//     }
											// });
											// todo: batchWriteItem -- 
											callback(null, {"mobile": cognitoUsr, "mobile_sub": mobile_sub2, "status": 'deleted!'});
										} else {
											callback(null, {'no amibo(mobile) record: ': 0});
										}
									}
								});
							}
							//delete end: MobileUser-XXXXXX
						}
					}
					else {
						console.log(`User: ${cognitoUsr} does not exist.`);
						callback(null, {'User does not exist: ': cognitoUsr});
						return;
					}
				}
			});
			break;
		}


		default: {
			callback(`Unknown field, unable to resolve ${event.field}`, null);
			break;
		}
	}
};
