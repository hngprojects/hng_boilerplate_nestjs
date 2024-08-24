const fs = require('fs');
const path = require('path');
const json = require('big-json');
const axios = require('axios');

const { pipeline } = require('stream');

const readStream = fs.createReadStream('./result.json');
const parseStream = json.createParseStream();

parseStream.on('data', async function (result) {
  const tests = () => {
    const Authentication = [];
    const Settings = [];
    const Avatars = [];
    const Blogs = [];
    const Rooms = [];
    const FAQs = [];
    const ContactUs = [];
    const Default = [];
    const Payment = [];
    const Game = [];
    const AboutUs = [];

    result.collection.item?.map(cat => {
      const category = cat.name;
      const subCategories = [];
      if (cat.name === 'Authentication' || cat.name === 'Settings') {
        cat.item.forEach(element => {
          element.item.forEach(el => {
            subCategories.push(el.name);
          });
        });
      } else {
        cat.item.forEach(element => {
          subCategories.push(element.name);
        });
      }

      testPassesSummary.forEach(test => {
        if (subCategories.includes(test.name)) {
          switch (category) {
            case 'Authentication':
              Authentication.push(test);
              break;
            case 'Settings':
              Settings.push(test);
              break;
            case 'Avatars':
              Avatars.push(test);
              break;
            case 'Blogs':
              Blogs.push(test);
              break;
            case 'Rooms':
              Rooms.push(test);
              break;
            case 'FAQs':
              FAQs.push(test);
              break;
            case 'Contact Us':
              ContactUs.push(test);
              break;
            case 'Default':
              Default.push(test);
              break;
            case 'Payment':
              Payment.push(test);
              break;
            case 'Game':
              Game.push(test);
              break;
            case 'About Us':
              AboutUs.push(test);
              break;
            default:
              break;
          }
        }
      });
    });
    return {
      AboutUs,
      Authentication,
      Avatars,
      Blogs,
      ContactUs,
      Default,
      FAQs,
      Game,
      Payment,
      Rooms,
      Settings,
    };
  };
  const testPassesSummary = result.run.executions.map(execution => ({
    name: execution.item.name,
    assertions: execution.assertions?.map(assertion => ({
      assertion: assertion.assertion,
      error: assertion.error ? assertion.error.message : null,
    })),
    requestUrl: execution.request.url.path.join('/'),
    host: execution.request.url.host.join('.'),
    responseTime: execution.response.responseTime,
    statusCode: execution.response.code,
    status: execution.response.status,
  }));

  // Create the summary object
  const summary = {
    last_checked: new Date(),
    stats: result.run.stats,
    tests: tests(),
  };
  const parsedData = parseNewmanResults(summary);
  await sendApiStatus(parsedData);
});

pipeline(readStream, parseStream, err => {
  if (err) {
    console.error('Pipeline failed.', err);
  } else {
    console.log('Pipeline succeeded.');
  }
});

const parseNewmanResults = summary => {
  const endpoints = [
    'Authentication',
    'Settings',
    'Avatars',
    'Blogs',
    'Rooms',
    'FAQs',
    'ContactUs',
    'Default',
    'Payment',
    'Game',
    'AboutUs',
  ];

  const finalData = [];
  let assertions = 0;
  endpoints.forEach(name => {
    let responseTimeSum = 0;
    let count = 0;
    const api_group = `${name} API`;
    let status = 'operational';
    let requests = [];

    if (summary.tests[name]) {
      summary.tests[name].forEach(request => {
        const eachRequest = {
          requestName: request.name,
          requestUrl: request.requestUrl,
          statusCode: request.statusCode,
          status: request.status,
          responseTime: request.responseTime,
          errors: [],
        };
        count++;
        responseTimeSum += request.responseTime;
        request.assertions?.forEach(assertion => {
          assertions++;
          if (assertion.error) {
            status = 'down';
            eachRequest.errors.push(assertion.error);
          }
        });
        requests.push(eachRequest);
      });
      const details = status === 'down' ? 'Some tests failed' : 'All tests passed';
      finalData.push({
        api_group,
        status,
        details,
        requests,
      });
    } else {
      finalData.push({
        api_group,
        status: 'No tests available',
        details: 'No data',
        requests,
      });
    }
  });
  return finalData;
};

async function sendApiStatus(apiStatusData) {
  try {
    const response = await axios.post(`${process.env.API_URL}api-status`, apiStatusData);
    console.log(response?.data);
    if (response.status === 201) {
      console.log(`Successfully sent data `);
    } else {
      console.error(`Failed to send data `);
    }
  } catch (error) {
    console.error(`Error sending data:`, error.message);
    console.log(error);
  }
}
