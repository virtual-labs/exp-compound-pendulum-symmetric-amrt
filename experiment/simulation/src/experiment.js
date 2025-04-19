/**Event handling functions starts here*/

/** Function used for changing the environment */
function setEnvironmentTypeFn(scope) {
    /**set selected environment gravity according to selection from the dropdown*/
	gravity =  environment_value_Array[scope.types_environment]
	scope.gravity = gravity;
}

/** Function to Reset the experiment */
function reset(scope) {
	stopExperiment(scope);
	resetWatch(); /** To reset the stopwatch */
	initialisationOfVariables(scope); 
	scope.hide_show_result = true; /** To hide the result */
	scope.resultValue = false; /** Untick the check box */
}

/** Check box function for show or hide the result */
function showresultFN(scope) {
    if (scope.resultValue == true) {
        scope.hide_show_result = false;
    } else {
        scope.hide_show_result = true;
    }
}

/** Function to return child element of stage */
function getChild(name){
	return compound_pendulam_stage.getChildByName(name);
}