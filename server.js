'use strict';
var http = require('http');
var request = require('request');
var apiHost = 'http://54.167.9.80:3000';
var dataApiHost = 'http://54.167.9.80:8080';
var wordClassifierHost = "http://54.167.9.80:9090"
var apiPort = '3000';


var OPERATOR_FORWARDING_MESSAGE = 'we could not find any match. Will redirect the call to operator.'

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);
        if (event.session.application.applicationId !== "amzn1.ask.skill.a154a123-c4a5-4f7e-82f3-cb6517885691") {
            context.fail("Invalid Application ID");
        }

        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId
        + ", sessionId=" + session.sessionId);

    // add any session init logic here
}

/**
 * Called when the user invokes the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log("onLaunch requestId=" + launchRequest.requestId
        + ", sessionId=" + session.sessionId);

    getWelcomeResponse(callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log("onIntent requestId=" + intentRequest.requestId
        + ", sessionId=" + session.sessionId);

    var intent = intentRequest.intent,
        intentName = intentRequest.intent.name;

    // handle yes/no intent after the user has been prompted
    if (session.attributes && session.attributes.userPromptedToContinue) {
        delete session.attributes.userPromptedToContinue;
        if ("AMAZON.NoIntent" === intentName) {
            handleFinishSessionRequest(intent, session, callback);
        } else if ("AMAZON.YesIntent" === intentName) {
            handleRepeatRequest(intent, session, callback);
        }
    }
    console.log("intent name is " + intentName);
    // dispatch custom intents to handlers here
    if ("AnswerIntent" === intentName) {
        handleAnswerRequest(intent, session, callback);
    } else if ("CompanyIntent" === intentName) {
        handleAnswerRequest(intent, session, callback);
    } else if ("CakeSupportIntent" === intentName) {
        handleRequestForCakeSupport(intent, session, callback);
    } else if ("BuyPosIntent" === intentName) {
        handleRequestForBuyPOS(intent, session, callback)
    } else if ("BuyVegetablesIntent" === intentName) {
        handleRequestForBuyVegetables(intent, session, callback)
    } else if ("BuyVegetablesIntent" === intentName) {
        handleRequestForBuyMeat(intent, session, callback)
    } else if ("CityNameIntent" === intentName) {
        handleRequestForCity(intent, session, callback)
    } else if ("PersonInDepartmentIntent" === intentName) {
        handleRequestForPersonInDepartment(intent, session, callback);
    } else if ("NameIntent" === intentName) {
        handleRequestForNameMention(intent, session, callback)
    } else if ("PersonIntent" === intentName) {
        handleRequestForPerson(intent, session, callback);
    } else if ("DontKnowIntent" === intentName) {
        handleAnswerRequest(intent, session, callback);
    } else if ("NewIntent" === intentName) {
        handleNewIntent(intent, session, callback);
    } else if ("AMAZON.YesIntent" === intentName) {
        handleAnswerRequest(intent, session, callback);
    } else if ("AMAZON.NoIntent" === intentName) {
        handleAnswerRequest(intent, session, callback);
    } else if ("AMAZON.StartOverIntent" === intentName) {
        getWelcomeResponse(callback);
    } else if ("AMAZON.RepeatIntent" === intentName) {
        handleRepeatRequest(intent, session, callback);
    } else if ("AMAZON.HelpIntent" === intentName) {
        handleGetHelpRequest(intent, session, callback);
    } else if ("AMAZON.StopIntent" === intentName) {
        handleFinishSessionRequest(intent, session, callback);
    } else if ("AMAZON.CancelIntent" === intentName) {
        handleFinishSessionRequest(intent, session, callback);
    } else {
        handleUnknownIntent(intent, session, callback);
    }
}

function handleRequestForNameMention(intent, session, callback) {
    var firstName = intent.slots.FirstName.value;
    var speechOutput = "Hello " + firstName + " . How can we help you";
    var sessionAttributes = {
        firstName: firstName
    };
    callback(sessionAttributes, buildSpeechletResponse(CARD_TITLE, speechOutput, speechOutput, false));
}

function handleUnknownIntent(intent, session, callback) {
    var speechOutput = " Sorry I cannot understand what you said , can you re phrase ?";
    var sessionAttributes = {};
    var repromptText = speechOutput;

    if (session.attributes != undefined && session.attributes.previousIntentName != undefined) {
        sessionAttributes.repeatUttrence = true;
        speechOutput = " Sorry I cannot understand what you said , can you re phrase again. or shall i transfer the call to an agent?";
    } else {
        sessionAttributes.repeatCount = 1;
    }

    callback(sessionAttributes, buildSpeechletResponse(CARD_TITLE, speechOutput, repromptText, false));
}

function handleRequestForCakeSupport(intent, session, callback) {
    var speechOutput = " Please wait while we transfer the call to our cake support team ";
    var sessionAttributes = {};
    callback(sessionAttributes, buildSpeechletResponse(CARD_TITLE, speechOutput, speechOutput, true));
}

function handleRequestForBuyPOS(intent, session, callback) {
    var speechOutput = " Please wait while we transfer the call to our cake sales team ";
    var sessionAttributes = {};
    callback(sessionAttributes, buildSpeechletResponse(CARD_TITLE, speechOutput, speechOutput, true));
}

function handleRequestForCity(intent, session, callback) {
    var speechOutput;
    var cityName = intent.slots.CityName.value;
    speechOutput = "Please wait while we transfer the call to the Agent Near " + cityName;

    var slotValue = null;
    var slotID = null;

    var firstName = session.attributes.firstName;
    if (session.attributes.previousIntentName == "vegetableIntent") {
        speechOutput = " , Please wait while we transfer your call to the Fresh Point Agent Near " + cityName;
        slotValue = 'vegetables';
        slotID = config.vegetables[session.attributes.requestSlotValue];
        // TODO set to learn

    } else if (session.attributes.previousIntentName == "meatIntent") {
        speechOutput = " , Please wait while we transfer your call to the Specialty Meat Agent Near " + cityName;
        slotID = config.vegetables[session.attributes.requestSlotValue];
    }
    if (firstName != undefined) {
        speechOutput = "Hello ! " + firstName + speechOutput;
    }
    var intentId = config.intent[session.attributes.previousIntentName];
    var cityId = config.city[cityName.replace(/ /g, '')];


    var sessionAttributes = {
        cityName: cityName
    };

    console.log('City intend received', intentId, cityId, slotValue, slotID);

    getLearntData(intentId, cityId, slotValue, slotID, sessionAttributes, callback, speechOutput);
}

function handleRequestForBuyVegetables(intent, session, callback) {
    var firstName = intent.slots.FirstName.value;
    var vegetableName = intent.slots.Vegetable.value;

    var speechOutput;
    var sessionAttributes = {};
    if (firstName != undefined) {
        speechOutput = "Hello " + firstName + " , Can I know where is your restaurant is located ?";
        sessionAttributes.firstName = firstName;
    } else {
        speechOutput = "Can I know where is your shop is located ?";
    }
    sessionAttributes.previousIntentName = "vegetableIntent";
    sessionAttributes.vegetableName = vegetableName;
    sessionAttributes.requestSlotValue = vegetableName;
    var repromptText = speechOutput;
    callback(sessionAttributes, buildSpeechletResponse(CARD_TITLE, speechOutput, repromptText, false));
}

function handleRequestForBuyMeat(intent, session, callback) {
    var firstName = intent.slots.FirstName.value;
    var meatName = intent.slots.Meat.value;

    var speechOutput;
    var sessionAttributes = {};
    if (firstName != undefined) {
        speechOutput = "Hello " + firstName + " , Can I know where is your restaurant is located ?";
        sessionAttributes.firstName = firstName;
    } else {
        speechOutput = "Can I know where is your shop is located ?";
    }
    sessionAttributes.previousIntentName = "meatIntent";
    sessionAttributes.meatName = meatName;
    sessionAttributes.requestSlotValue = vegetableName;

    var repromptText = speechOutput;
    callback(sessionAttributes, buildSpeechletResponse(CARD_TITLE, speechOutput, repromptText, false));
}

function sendResponseForMultiPersonMatch(result, sessionAttributes, callback) {
    var speechOutPut = ' we have found multiple matches. Can we know the department ?';
    if (sessionAttributes.caller != undefined) {
        speechOutPut = 'Hello ' + sessionAttributes.caller + speechOutPut;
    }
    callback(sessionAttributes, buildSpeechletResponse(CARD_TITLE, speechOutPut, speechOutPut, false));
}

function sendResponseForSinglePersonMatch(result, sessionAttributes, callback) {
    var speechOutPut = ' Please wait while we transfer the call to ' + sessionAttributes.firstName;
    if (sessionAttributes.caller != undefined) {
        speechOutPut = 'Hello ' + sessionAttributes.caller + speechOutPut;
    }
    callback(sessionAttributes, buildSpeechletResponse(CARD_TITLE, speechOutPut, speechOutPut, true));
}

function sendResponseForNoPersonMatch(sessionAttributes, callback) {
    var speechOutPut = OPERATOR_FORWARDING_MESSAGE;
    callback(sessionAttributes, buildSpeechletResponse(CARD_TITLE, speechOutPut, speechOutPut, true));
}

function handleRequestForPerson(intent, session, callback) {

    var caller = intent.slots.CallerName.value;

    console.log('Handling request for person intent');
    var firstName = intent.slots.FirstName.value;
    var lastName = intent.slots.LastName.value;
    console.log('Name:', firstName, lastName);

    var options = {};
    options.uri = apiHost + '/getByName';
    options.qs = {'firstName': firstName};
    options.method = 'GET';
    options.json = true;

    if (typeof lastName !== 'undefined') {
        options.qs["lastName"] = lastName;
    }

    var sessionAttributes = {};
    sessionAttributes.previousIntentName = "personIntent";
    sessionAttributes.firstName = firstName;
    sessionAttributes.lastName = lastName;
    sessionAttributes.caller = caller;

    request(options, function (error, response, body) {
        // console.log(response);
        // console.log(error);
        if (!error && response.statusCode == 200) {
            if (body.result.length > 1) {
                // Print out the response body
                var ids = body.result[0].ID;
                for (var i = 1; i < body.result.length; i++) {
                    ids += ',' + body.result[i].ID
                }
                sessionAttributes.ids = ids;
                sendResponseForMultiPersonMatch(body.result, sessionAttributes, callback);
            } else if (body.result.length == 1) {
                sendResponseForSinglePersonMatch(body.result[0], sessionAttributes, callback);
            } else {
                sendResponseForMultiPersonMatch(body.result, sessionAttributes, callback);
                //sendResponseForNoPersonMatch(sessionAttributes, callback);
                redirectToOperator();
            }
            console.log(body);
        }
    }).end();
}

function handleRequestForPersonInDepartment(intent, session, callback) {
    console.log('Handling request for person in department');
    var options = {};
    options.uri = apiHost + '/getByNameAndDepartment';
    options.qs = {
        'ids': session.attributes.ids,
        'dep': intent.slots.DEPARTMENT.value
    };
    console.log('data:', options.qs);
    options.method = 'GET';
    options.json = true;

    var sessionAttributes = {};
    var speechOutPut = ' Please wait while we transfer the call to ' + session.attributes.firstName + " from the "
        + intent.slots.DEPARTMENT.value + " department";
    callback(sessionAttributes, buildSpeechletResponse(CARD_TITLE, speechOutPut, speechOutPut, true));
    //request(options, function (error, response, body) {
    //    if (!error && response.statusCode == 200) {
    //        if (body.result != null && body.result.length > 0) {
    //            sendResponseForSinglePersonMatch(body.result[0], session.attributes, callback);
    //            redirect(body.result[0]);
    //        } else {
    //            sendResponseForNoPersonMatch(session.attributes, callback);
    //            redirectToOperator();
    //        }
    //    }
    //});
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId
        + ", sessionId=" + session.sessionId);

    // Add any cleanup logic here
}

// ------- Skill specific business logic -------

var CARD_TITLE = "Sysco One Call"; // Be sure to change this for your skill.

function getWelcomeResponse(callback) {
    var sessionAttributes = {},
        speechOutput = " Welcome to Sysco , How can we help you ?";
    var repromptText = speechOutput;
    var shouldEndSession = false;

    callback(sessionAttributes,
        buildSpeechletResponse(CARD_TITLE, speechOutput, repromptText, shouldEndSession));
}

function handleAnswerRequest(intent, session, callback) {
    var speechOutput = "";
    var sessionAttributes = {};
    var gameInProgress = session.attributes && session.attributes.questions;

    if (intent.name === "CompanyIntent") {
        speechOutput = " Routing to the requested company";
        var repromptText = speechOutput;
        sessionAttributes = {
            "speechOutput": repromptText,
            "repromptText": repromptText
        };
        callback(sessionAttributes,
            buildSpeechletResponse(CARD_TITLE, speechOutput, repromptText, false));
    } else {


    }
}

function handleRepeatRequest(intent, session, callback) {
    // Repeat the previous speechOutput and repromptText from the session attributes if available
    // else start a new game session
    if (!session.attributes || !session.attributes.speechOutput) {
        getWelcomeResponse(callback);
    } else {
        callback(session.attributes,
            buildSpeechletResponseWithoutCard(session.attributes.speechOutput, session.attributes.repromptText, false));
    }
}

function handleGetHelpRequest(intent, session, callback) {
    // Provide a help prompt for the user, explaining how the game is played. Then, continue the game
    // if there is one in progress, or provide the option to start another one.

    // Set a flag to track that we're in the Help state.
    session.attributes.userPromptedToContinue = true;

    var speechOutput = " Welcome to Sysco , How can we help you ?";
    var repromptText = "Please repharase so question, or shall I transfer the call to the customer service operator";
    var shouldEndSession = false;
    callback(session.attributes,
        buildSpeechletResponseWithoutCard(speechOutput, repromptText, shouldEndSession));
}

function handleFinishSessionRequest(intent, session, callback) {
    // End the session with a "Good bye!" if the user wants to quit the game
    callback(session.attributes,
        buildSpeechletResponseWithoutCard("Good bye!", "", true));
}

// ------- Helper functions to build responses -------
function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title: title,
            content: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildSpeechletResponseWithoutCard(output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}

function setLearn() {

}

function getLearntData(intentCode, cityCode, slotType, slotCode, sessionAttributes, callback, speechOutput) {
    var requestJson = {};
    requestJson.INTENTION = intentCode;
    requestJson.CITY = cityCode;
    requestJson[slotType] = slotCode;

    var options = {};
    options.uri = dataApiHost + '/predict';
    options.json = true;
    options.method = 'POST';
    options.headers = {
        'Content-Type': 'application/json'
    };
    options.body = requestJson;

    console.log('Loading learnt data');

    request(options, function (error, response, body) {
        console.log(error);
        console.log(body);
        if (!error && response.statusCode == 200) {
            redirect(body.PREDICTION);
        } else {
            speechOutput = OPERATOR_FORWARDING_MESSAGE;
            redirectToOperator();
        }
        callback(sessionAttributes, buildSpeechletResponse(CARD_TITLE, speechOutput, speechOutput, true));
    });
}

function handleNewIntent(intent, session, callback) {

    console.log('Handle new intent called');
    var requestJson = {};
    requestJson.input = "I want to purchase an oven for my new restaurant";

    var options = {};
    options.uri = wordClassifierHost + '/WordClassifier/rest/posidentifier/posClassifier';
    options.json = true;
    options.method = 'POST';
    options.headers = {
        'Content-Type': 'application/json'
    };
    options.body = requestJson;

    console.log('Loading response from part of speech.');

    request(options, function (error, response, body) {
        console.log(error);
        console.log(body);
        var speechOutput;
        var saveData = false;
        if (!error && response.statusCode == 200) {
            if (body.status == "Not Found") {
                saveData = true;
                speechOutput = "Sorry we could not find a match. Please wait while we transfer your call to the operator";
            } else {
                speechOutput = "Please wait while we transfer your call to supplies on the fly."
            }
        } else {
            speechOutput = OPERATOR_FORWARDING_MESSAGE;
            redirectToOperator();
        }
        saveStatus(saveData, true, requestJson.input, callback, buildSpeechletResponse(CARD_TITLE, speechOutput, speechOutput, true));

    });

}


function saveStatus(saveData, status, message, callback, speechResponse) {
    if (!saveData) {
        callback({}, speechResponse);
    } else {
        console.log("saving status in database");
        var options = {};
        options.uri = apiHost + '/setTransfer';
        options.qs = {'state': status, "query": message};
        options.method = 'GET';
        options.json = true;

        console.log(status, message);

        request(options, function (error, response, body) {
            console.log(error);
            console.log(response);
            console.log(body);
            callback({}, speechResponse);
        });
    }
}


function redirect(number, name) {
    console.log('Redirected to:', number, name);
}

function redirectToOperator(utterence) {
    console.log('Redirect to human operator');
    //var requestJson = {};
    //requestJson.INTENTION = intentCode;
    //requestJson.CITY = cityCode;
    //requestJson[slotType] = slotCode;
    //
    //var options = {};
    //options.uri = dataApiHost + '/predict';
    //options.json = true;
    //options.method = 'POST';
    //options.headers = {
    //    'Content-Type': 'application/json'
    //};
    //options.body = requestJson;
    //
    //console.log('Loading learnt data');
    //
    //request(options, function (error, response, body) {
    //    console.log(error);
    //    console.log(body);
    //    if (!error && response.statusCode == 200) {
    //        redirect(body.PREDICTION);
    //    } else {
    //        speechOutput = OPERATOR_FORWARDING_MESSAGE;
    //        redirectToOperator();
    //    }
    //    callback(sessionAttributes, buildSpeechletResponse(CARD_TITLE, speechOutput, speechOutput, true));
    //});
}

var config = {
    city: {
        NewYork: 1,
        CA: 2
    },
    intent: {
        vegetableIntent: 1,
        meatIntent: 2,
        tableIntent: 3
    },
    vegetables: {
        tomato: 1,
        garlic: 2,
        potato: 3,
        vegetables: 4,
        fruits: 5
    },
    meat: {
        chicken: 1,
        beef: 2,
        meat: 3,
        fish: 4
    }
}
