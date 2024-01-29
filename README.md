# maxpayload-api

This Node.js utility provides an API endpoint to generate a large JSON or XML response based on the specified size. It streams the data to minimize memory consumption, making it suitable for scenarios with large response requirements.

## Table of Contents

- [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
- [API Endpoint](#api-endpoint)
- [Contributing](#contributing)

## Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/kk-karthi/maxpayload-api.git

2. Navigate to the project directory:

    ```bash
    cd maxpayload-api

3. Install dependencies:

    ```bash
    npm install

4. Usage
   Run the server using the following command:

    ```bash
    node app.js

The server will start on http://localhost:3000.

### API Endpoint

`/large-response`: Generates a large JSON or XML response based on the specified size.
Query Parameters:
* sizeInBytes (optional): Size of the response in bytes. Default is 1024.
* format: Response format (xml or json).
* dataConfig: Data configuration for generating responses. For example,
    ```json
    {
      "id": 2,
      "name": "CustomRecord",
      "value": 42
    }
    ```
* primary: (Optional) Specify the primary property for data randomization.

Example:
http://localhost:3000/large-response?format=xml&sizeInBytes=1024&primary=id&dataConfig={"id":2,"name":"CustomRecord","value":42}


## Contributing
Contributions are welcome! Feel free to open issues or submit pull requests.