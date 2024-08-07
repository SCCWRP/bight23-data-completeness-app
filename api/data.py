import pandas as pd
from flask import Blueprint, request, jsonify, g, current_app


data_api = Blueprint('data_api', __name__, template_folder = 'templates')

# for printing
pd.set_option('display.max_columns', 15)

@data_api.route('/completeness-report-json', methods=['GET', 'POST'])
def completeness_report_json():


    # The sqlalchemy database connection object
    eng = g.eng 

    report_types = current_app.config.get("REPORT_TYPES")

    dtype = request.args.get('dtype')
    grouping = request.args.get('grouping')

    # Checking for programmer errors
    assert \
        isinstance(report_types, dict), \
        "ERROR: report types is not a dictionary - check __init__.py and make sure the app is configured properly"
        

    # Checking for user errors (Could also be errors on the front end programming)
    if dtype not in report_types.keys():
        resp = {
            "error": "Invalid query string arg",
            "message": f"Invalid data type ({dtype}) provided in query string args"
        }
        return jsonify(resp), 400


    # Checking for programmer errors
    assert \
        isinstance(report_types.get(dtype), dict), \
        f"ERROR: report types subdictionary (key: {dtype}) is not a dictionary - check __init__.py and make sure the app is configured properly"
        
    # Checking for user errors (Could also be errors on the front end programming)
    if grouping not in report_types.get(dtype).keys():
        resp = {
            "error": "Invalid query string arg",
            "message": f"Invalid grouping option ({grouping}) provided in query string args"
        }
        return jsonify(resp), 400
    
    # Select the data from the view and return to the browser
    data = pd.read_sql(
        f"""
            SELECT 
                row_id, 
                {grouping}, 
                assigned_parameter, 
                n_stations, 
                n_finished_stations, 
                percent_completion, 
                unfinished_stations, 
                finished_stations, 
                all_stations  
            FROM 
                {report_types.get(dtype).get(grouping)};
        """, 
        eng
    )
    jsondata = data.to_dict(orient='records')

    print("jsondata")
    print(jsondata)
    
    return jsonify(data = jsondata), 200




@data_api.route('/dtypes', methods=['GET', 'POST'])
def dtypes():

    report_types = current_app.config.get("REPORT_TYPES")

    # Checking for programmer errors
    assert \
        isinstance(report_types, dict), \
        "ERROR: report types is not a dictionary - check __init__.py and make sure the app is configured properly"
            
    return jsonify(dtypes = list(report_types.keys()) ), 200



@data_api.route('/groupings', methods=['GET', 'POST'])
def groupings():

    report_types = current_app.config.get("REPORT_TYPES")

    dtype = request.args.get('dtype')

    # Checking for programmer errors
    assert \
        isinstance(report_types, dict), \
        "ERROR: report types is not a dictionary - check __init__.py and make sure the app is configured properly"
        

    # Checking for user errors (Could also be errors on the front end programming)
    if dtype not in report_types.keys():
        resp = {
            "error": "Invalid query string arg",
            "message": f"Invalid data type ({dtype}) provided in query string args"
        }
        return jsonify(resp), 400


    # Checking for programmer errors
    assert \
        isinstance(report_types.get(dtype), dict), \
        f"ERROR: report types subdictionary (key: {dtype}) is not a dictionary - check __init__.py and make sure the app is configured properly"
        
    return jsonify(groupings = list(report_types.get(dtype).keys()) )




@data_api.errorhandler(Exception)
def handle_exception(e):
    
    # - Catch exceptions, print error message to the logs
    # - Return an error json with a 500 error code to let the frontend/user know that its a server side error
    
    # log the error
    print(e)
    resp = {
        "error": "Internal server error",
        "message": "Application failure"
    }
    return jsonify(resp), 500