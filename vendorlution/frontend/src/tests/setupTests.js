import '@testing-library/jest-dom';
import 'whatwg-fetch'; // fetch() in jsdom
// If you use MSW:
// import { server } from './server';
// beforeAll(() => server.listen());
// afterEach(() => server.resetHandlers());
// afterAll(() => server.close());