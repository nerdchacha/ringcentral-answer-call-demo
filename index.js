const { SDK } = require('@ringcentral/sdk');
const { Subscriptions } = require('@ringcentral/subscriptions');
const { RingCentralCallControl } = require('ringcentral-call-control');
require('dotenv').config();

const appClientId = process.env.RC_CLIENT_ID;
const appClientSecret = process.env.RC_CLIENT_SECRET;
const username = process.env.RC_USERNAME;
const password = process.env.RC_PASSWORD;
const extension = process.env.RC_EXTENSION;
const deviceId = process.env.RC_DEVICE_ID;
const appName = 'answer-call-party-demo';
const appVersion = '0.0.1';

const sdk = new SDK({
	clientId: appClientId,
	clientSecret: appClientSecret,
	appName: appName,
	appVersion: appVersion,
	server: SDK.server.production, // or .sandbox
});
const subscriptions = new Subscriptions({ sdk: sdk });
const platform = sdk.platform();

platform.login({ username, password, extension }).then(() => {
	console.log('SUCCESSFULLY LOGGED IN');
	const rcCallControl = new RingCentralCallControl({ sdk: sdk });
	const subscription = subscriptions.createSubscription();

	subscription.setEventFilters(['/restapi/v1.0/account/~/extension/~/telephony/sessions']);
	subscription.on(subscription.events.notification, function (msg) {
		rcCallControl.onNotificationEvent(msg);
	});
	subscription.register();
	console.log('SUCCESSFULLY CREATED SUBSCRIPTION');
	rcCallControl.on('new', async (session) => {
		console.log('RECIEVED NEW SESSION', JSON.stringify(session, null, 2));
		try {
			// Accepting the call using the ringcentral-call-control SDK
			console.log('TRYING TO ACCEPT CALL USING THE SDK');
			await session.answer({ deviceId });

			// Accepting using API
			console.log('SUCCESSFULLY ACCEPTED THE CALL USIN API');
		} catch (e) {
			console.log('ERROR ACCEPTING THE CALL USING API');
			console.log(e.response.data);
			console.log(e);
		}
	});
});
