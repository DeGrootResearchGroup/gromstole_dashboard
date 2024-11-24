// unit tests for env file
describe('env', () => {
    it('check if env var REACT_APP_BASEURL_DEV exists', () => {
        expect(process.env.REACT_APP_API_DEVELOPMENT_URL).toBeDefined();
    });
    it('check if env var REACT_APP_BASEURL_PROD exists', () => {
        expect(process.env.REACT_APP_API_PRODUCTION_URL).toBeDefined();
    });
    it('check if env var REACT_APP_API_TEST_URL exists', () => {
        expect(process.env.REACT_APP_API_TEST_URL).toBeDefined();
    });
    it('check if env var REACT_APP_API_LINEAGE_HEADERS_ENDPOINT exists', () => {
        expect(process.env.REACT_APP_API_LINEAGE_HEADERS_ENDPOINT).toBeDefined();
    });
    it('check if env var REACT_APP_API_MUTATION_HEADERS_ENDPOINT exists', () => {
        expect(process.env.REACT_APP_API_MUTATION_HEADERS_ENDPOINT).toBeDefined();
    });
    it('check if env var REACT_APP_API_SPARSE_MATRIX_ENDPOINT exists', () => {
        expect(process.env.REACT_APP_API_SPARSE_MATRIX_ENDPOINT).toBeDefined();
    });
    it('check if env var REACT_APP_REACT_ENV exists', () => {
        expect(process.env.REACT_APP_REACT_ENV).toBeDefined();
    });
});