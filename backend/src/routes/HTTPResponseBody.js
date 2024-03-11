class HTTPResponseBody {
    _severity;

    constructor(message = null, error = null, data = null) {
        this.message = message;
        this.error = error;
        this.data = data;
    }

    setMessage(message, severity = 'success') {
        this._severity = severity;
        this.message = message;
    }

    setError(error) {
        this._severity = 'error';
        this.error = error;
    }

    setData(data) {
        this.data = data;
    }

    getLiteralObject() {
        return {
            message: this.message,
            severity: this._severity,
            error: this.error,
            data: this.data
        }
    }
}

module.exports = HTTPResponseBody;