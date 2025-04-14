import logging
from flask import Flask, jsonify, request, Response
from flask_cors import CORS

from back_api.info import get_parameters_dict


logging.basicConfig(
    level=logging.INFO,
    filename='service_log.log', filemode='w',
    format="%(asctime)s %(levelname)s %(filename)s:%(lineno)d %(funcName)s() %(message)s",
    force=True
)

app = Flask(__name__)
CORS(app)


@app.route('/api/get_info', methods=['POST', 'GET'])
def find_pizzas_by_budget() -> tuple[Response, int]:
    data = request.get_json()
    print(data['text'].replace('\n', ' '))
    compilation = get_parameters_dict(data['text'].replace('\n', ' '))
    print(compilation)

    return jsonify(compilation), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=False)
