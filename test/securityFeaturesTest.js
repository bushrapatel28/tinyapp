const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;

chai.use(chaiHttp);

describe('User Authentication and Access Control', function() {
  // Increase the timeout if your requests take longer due to server response times
  this.timeout(5000);

  it('Log in as user2@example.com and expects 403 on accessing /urls/b2xVn2', done => {
    // Create a new agent instance
    const agent = chai.request.agent('http://localhost:8080');

    // First, login to create a session
    agent
      .post('/login')
      .send({
        email: 'user2@example.com',
        password: 'dishwasher-funk'
      })
      .then(res => {
        // Check if login was successful
        expect(agent).to.have.cookie('session');

        // Using the same agent to make a subsequent request
        // that uses the session cookie automatically
        return agent.get('/urls/b2xVn2')
          .then(res => {
            // Expect a 403 Forbidden response
            expect(res).to.have.status(403);
            agent.close(); // Close the persistent connection
            done();
          });
      })
      .catch(function(err) {
        agent.close(); // Ensure agent is closed in case of errors
        done(err);
      });
  });
});

describe('Route Access Control', function() {
  // Keep this if requests take a long time
  this.timeout(5000);

  const agent = chai.request.agent('http://localhost:8080');

  after(function() {
    agent.close(); // Close agent after all tests
  });

  it('redirects to /login when accessing the root URL without being logged in', done => {
    agent
      .get('/')
      .redirects(0)
      .then(res => {
        expect(res).to.redirectTo('/login');
        expect(res).to.have.status(302);
        done();
      })
      .catch(err => done(err));
  });

  it('redirects to /login when trying to access "/urls/new" without being logged in', done => {
    agent
      .get('/urls/new')
      .redirects(0)
      .then(res => {
        expect(res).to.redirectTo('/login');
        expect(res).to.have.status(302);
        done();
      })
      .catch(err => done(err));
  });

  it('receives a 404 status code when trying to access a non-existent URL shortcode "/urls/NOTEXISTS"', done => {

    // First, login to create a session
    agent
      .post('/login')
      .send({
        email: 'user2@example.com',
        password: 'dishwasher-funk'
      })
      .then(res => {
        // Check if login was successful
        expect(agent).to.have.cookie('session');

        return agent
          .get('/urls/NOTEXISTS')
          .then(res => {
            expect(res).to.have.status(404);
            done();
          });
      })
      .catch(err => done(err));
  });

  it('receives a 403 status code when trying to access "/urls/b2xVn2" without proper authorization', done => {
    agent
      .get('/urls/b2xVn2')
      .then(res => {
        expect(res).to.have.status(403);
        done();
      })
      .catch(err => done(err));
  });
});