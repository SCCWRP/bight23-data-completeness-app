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
                n_abandoned_stations, 
                unfinished_stations, 
                finished_stations, 
                abandoned_stations,
                all_stations  
            FROM 
                {report_types.get(dtype).get(grouping)};
        """, 
        eng
    )
    jsondata = data.to_dict(orient='records')

    print("jsondata")
    print(jsondata)
    
    return jsonify(data = jsondata, ordered_columns = list(data.columns)), 200




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



@data_api.route('/station-data', methods=['GET', 'POST'])
def station_data():
    
    eng = g.eng

    request_data = request.json

    all_stations = request_data.get('all_stations')
    unfinished_stations = request_data.get('unfinished_stations')
    finished_stations = request_data.get('finished_stations')
    abandoned_stations = request_data.get('abandoned_stations')
    
    dtype = request_data.get('dtype')
    collectiontype = current_app.config.get('REPORT_GROUPINGS').get(dtype)

    print("dtype")
    print(dtype)
    print("collectiontype")
    print(collectiontype)

    all_stations = [str(x).strip().replace('"','').replace("'",'') for x in all_stations.split(',')] if all_stations is not None else []
    unfinished_stations = [str(x).strip().replace('"','').replace("'",'') for x in unfinished_stations.split(',')] if unfinished_stations is not None else []
    finished_stations = [str(x).strip().replace('"','').replace("'",'') for x in finished_stations.split(',')] if finished_stations is not None else []
    abandoned_stations = [str(x).strip().replace('"','').replace("'",'') for x in abandoned_stations.split(',')] if abandoned_stations is not None else []
    
    all_station_sql = f"""SELECT * FROM vw_stationoccupation_assignment_sunmmary WHERE stationid IN ('{"','".join(all_stations)}') """
    all_station_sql += f""" AND collectiontype = '{str(collectiontype).lower()}' """ if collectiontype is not None else ''
    print("all_station_sql")
    print(all_station_sql)
    all_station_data = pd.read_sql(all_station_sql, eng)

    unfinished_station_sql = f"""SELECT * FROM vw_stationoccupation_assignment_sunmmary WHERE stationid IN ('{"','".join(unfinished_stations)}') """
    unfinished_station_sql += f""" AND collectiontype = '{str(collectiontype).lower()}' """ if collectiontype is not None else ''
    print("unfinished_station_sql")
    print(unfinished_station_sql)
    unfinished_station_data = pd.read_sql(unfinished_station_sql, eng)
    
    finished_station_sql = f"""SELECT * FROM vw_stationoccupation_assignment_sunmmary WHERE stationid IN ('{"','".join(finished_stations)}') """
    finished_station_sql += f""" AND collectiontype = '{str(collectiontype).lower()}' """ if collectiontype is not None else ''
    print("finished_station_sql")
    print(finished_station_sql)
    finished_station_data = pd.read_sql(finished_station_sql, eng)
    
    abandoned_station_sql = f"""SELECT * FROM vw_stationoccupation_assignment_sunmmary WHERE stationid IN ('{"','".join(abandoned_stations)}') """
    abandoned_station_sql += f""" AND collectiontype = '{str(collectiontype).lower()}' """ if collectiontype is not None else ''
    print("abandoned_station_sql")
    print(abandoned_station_sql)
    abandoned_station_data = pd.read_sql(abandoned_station_sql, eng)
     
    return jsonify(
        all_station_data = all_station_data.fillna('').to_dict(orient='records'), 
        unfinished_station_data = unfinished_station_data.fillna('').to_dict(orient='records'), 
        finished_station_data = finished_station_data.fillna('').to_dict(orient='records'),
        abandoned_station_data = abandoned_station_data.fillna('').to_dict(orient='records'),
        ordered_columns = list(all_station_data.columns)
    ), 200




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