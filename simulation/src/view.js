(function() {
    angular.module('users')
        .directive("experiment", directiveFunction)
})();

var compound_pendulam_stage, exp_canvas, tick, rotate_timer;

var environmentArray = environment_value_Array = help_array = [];

var angle, alphaa, real_time, r, mass, pendulum_length, gravity, drag, pendulam_drag_flag, pendulam_rotation_flag ;

var theta, omega, half_length, radius_of_gyration, updateCount, time_since_last_step,t1, registration_point_y, mPowThird;

function directiveFunction() {
    return {
        restrict: "A",
        link: function(scope, element, attrs) {
            /** Variable that decides if something should be drawn on mouse move */
            var experiment = true;
            if (element[0].width > element[0].height) {
                element[0].width = element[0].height;
                element[0].height = element[0].height;
            } else {
                element[0].width = element[0].width;
                element[0].height = element[0].width;
            }
            if (element[0].offsetWidth > element[0].offsetHeight) {
                element[0].offsetWidth = element[0].offsetHeight;
            } else {
                element[0].offsetWidth = element[0].offsetWidth;
                element[0].offsetHeight = element[0].offsetWidth;
            }
			exp_canvas = document.getElementById("demoCanvas");
            exp_canvas.width = element[0].width;
            exp_canvas.height = element[0].height;
			/** Stage initialization */
            compound_pendulam_stage = new createjs.Stage("demoCanvas");
            /** Preloading the images in a queue */
            queue = new createjs.LoadQueue(true);
            queue.installPlugin(createjs.Sound);
			loadingProgress(queue,compound_pendulam_stage,exp_canvas.width)
            queue.on("complete", handleComplete, this);
            queue.loadManifest([{
                id: "background",
                src: "././images/background.svg",
                type: createjs.LoadQueue.IMAGE
            }, {
                id: "scale",
                src: "././images/scale.svg",
                type: createjs.LoadQueue.IMAGE
            }, {
                id: "nut_and_clamp",
                src: "././images/nut_and_clamp.svg",
                type: createjs.LoadQueue.IMAGE
            }]);
            compound_pendulam_stage.enableDOMEvents(true);
            compound_pendulam_stage.enableMouseOver();
			createjs.Touch.enable(compound_pendulam_stage); /** Enable touch events */ 
			tick = setInterval(updateStage, 1); /** Stage update function in a timer */
            function handleComplete() {
				pause_flag = false;
                /** Loading all images in the queue to the stage */
                loadImages(queue.getResult("background"), "background", 0, 0, "", 0, 1, compound_pendulam_stage);
                loadImages(queue.getResult("scale"), "scale", 360, 227, "pointer", 0, 1, compound_pendulam_stage);
                loadImages(queue.getResult("nut_and_clamp"), "nut_and_clamp", 0, 0, "", 0, 1, compound_pendulam_stage);
				/** Text loading */
				setText("mass_label", 100, 100, _("Mass : 1 Kg"), "#b0c4de ", 1);
				/** Function for setting stopwatch */
				createStopwatch (compound_pendulam_stage,450,520,1);
                /** Initializing the variables */
                initialisationOfVariables(scope);
                /** Translation of strings using gettext */
                translationLabels();
				/** Stage listeners for checking mouse events */
				var mouseMove = function(){
					pause_flag = true;
					scope.resultValue = false; /** untick the checkbox */
					omega = 0;
					var rads = Math.atan2(compound_pendulam_stage.mouseY - getChild("scale").y, compound_pendulam_stage.mouseX - getChild("scale").x);
					angle = rads * (180 / Math.PI) - offset;
					/** Restricting the angle to 40 degree/-40 degree */
					 if ( angle < -40 ) {
						angle =- 40;
					}
					if ( angle > 40 ) {
						angle = 40;
					} 
					theta = angle*Math.PI/180;
					mPowThird=Math.pow(mass,3.333333E-001);
					var l1 = Math.abs(half_length-(pendulum_length*5));
					var l2 = (radius_of_gyration*radius_of_gyration)/l1;
					alphaa =- gravity/((l1+l2)/100)*Math.sin(theta)-drag/mPowThird*omega;
					getChild("scale").rotation = angle;
				};
				var offset = 0;
				getChild("scale").addEventListener("mousedown", function(evt){ 
					if ( evt.stageY >240 ) {//Restricting the drag to the lower end of pendulam 
					clearInterval(rotate_timer);
					pendulam_rotation_flag=false;
					pendulam_drag_flag=true;
					compound_pendulam_stage.addEventListener("stagemousemove", mouseMove);
					// Determine initial offset, and take off shape rotation
					var rads = Math.atan2(compound_pendulam_stage.mouseY - getChild("scale").y, compound_pendulam_stage.mouseX - getChild("scale").x);
					offset = rads * (180 / Math.PI);
					mouseMove();
					}
				});
				compound_pendulam_stage.addEventListener("stagemouseup", function(){
					if (pendulam_drag_flag == true) {
						pendulam_drag_flag = false;
						if ((! pendulam_rotation_flag) ) {
							pendulam_rotation_flag=true;
							scope.dropdown_disable = true;
							scope.$apply();
							compound_pendulam_stage.removeEventListener("stagemousemove", mouseMove);
							lastTime = now();
							t1 = 0;
							updateCount=0;
							clearInterval(rotate_timer);
							rotate_timer = setInterval(function() {
								PlayPendulam(scope);
							}, 1);
						}
					}
				});
				//Function for Ocsillating the Pendulum
				function PlayPendulam(scope) { //scope.result_disable = false;
					scope.result_disable = true;
					scope.hide_show_result = true;
					if ( pause_flag == false ) {
						scope.resultValue = false; /** Untick the check box */
						scope.hide_show_result = true;/** To hide the result */
					}
					if ( pendulam_rotation_flag == true && pause_flag == true && lapTime > 0) {
						scope.result_disable = false; /** To show the result */
						if (scope.resultValue == true) scope.hide_show_result = !scope.hide_show_result;
					}
					scope.$apply();
				/** starting the stop watch */	
					real_time = now();
					var time_since_last_step = ((real_time - lastTime))+.1;
					lastTime = real_time;
					var dt = Math.min(5.000000E-002,r*time_since_last_step/1000);
					theta = theta+omega*dt+(5.000000E-001)*alphaa*dt*dt;
					var oldAlpha = alphaa;
					mPowThird=Math.pow(mass,3.333333E-001);
					var l1 = Math.abs(half_length-(pendulum_length*5));
					var l2 = (radius_of_gyration*radius_of_gyration)/l1;
					alphaa =-gravity/((l1+l2)/100)*Math.sin(theta)-drag/mPowThird*omega;
					omega =omega + 5.000000E-001 * (alphaa + oldAlpha) * dt;
					t1 = t1+dt;
					updateCount = updateCount+1;
					if ( updateCount%1 == 0 ) {
						if ( scope.length != 50 ) { 
							getChild("scale").rotation = (theta * 180 / Math.PI);
						}
					}
				}
				function now() {
					return window.performance ? window.performance.now() : Date.now();
				}
				scope.$apply();
				updateStage();
            }
				
            /** Add all the strings used for the language translation here.
			'_' is the short cut for calling the gettext function defined in the gettext-definition.js */
            function translationLabels() { /** Labels used in the experiment initialize here */
                /** This help array shows the hints for this experiment */
                help_array = [_("help1"), _("help2"), _("help3"), _("help4"), _("help5"), _("help6"), _("help7"), _("Next"), _("Close")];
                /** Experiment name */
				scope.heading = _("Compound Pendulum"); 
				/**Show Result checkbox label*/
                scope.show_result = _("Show Result");
				/**Mass of the block slider label*/				
                scope.change_length = _("Length"); 
				/** 'Stop' button label */
                scope.stop_label = _("Stop");
				/** 'Reset' button label */				
                scope.reset_label = _("Reset"); 
				/**environment unit*/
				scope.gyration_unit = _("m"); 
			    scope.gravity_unit = _("m/s");
				scope.inertia_unit = _("kgm");
				scope.gravity = 9.8;
				scope.gyration = 0.25;
				scope.inertia = 0.26500;
				/** length unit */
                scope.length_unit = _("cm"); 
				/**environment dropdown value*/
                scope.earth = _("Earth(g=9.8 m/s)"); 
				/**environment dropdown label*/
                scope.environment_types = _("Environment"); 
                /**array that shows different type of environment*/
                scope.environmentArray = [{
                    environment: _('Earth(g=9.8 m/s)'),
                    type: 0
                }, {
                    environment: _('Moon(g=1.62 m/s)'),
                    type: 1
                }, {
                    environment: _('Uranus(g=9.01 m/s)'),
                    type: 2
                }, {
                    environment: _('Neptune(g=11.28 m/s)'),
                    type: 3
                }, {
                    environment: _('Jupitor(g=25.93 m/s)'),
                    type: 4
                }, {
                    environment: _('Venus(g=8.87 m/s)'),
                    type: 5
                }, {
                    environment: _('Mercury(g=3.70 m/s)'),
                    type: 6
                }];
				/**label for values shown in the result part*/
                scope.result_label1 = _("Accelaration due to Gravity,g ");
                scope.result_label2 = _("Radius of Gyration,K");
                scope.result_label3 = _("Moment of Inertia,I");
				scope.variables = _("Variables");
                scope.result = _("Result");
                scope.copyright = _("copyright");
                scope.$apply();
            }
        }
    }
}

/** Function to change the length of pendulum */
function changeLengthFn(scope) {
	getChild("scale").rotation = 0; //setting the pendulum to initial position
	clearInterval(rotate_timer);
	var _scale_factor = 15;
	var _increment = 6.5;
	var _length_in_meter 
	if ( scope.length <= 50 ) {
		registration_point_y = (_scale_factor *(scope.length/5)) + _increment; /** Setting the registration point of scale for slider value less /equal to 50 */
	} else {
		registration_point_y = (_scale_factor * (100-scope.length)/5) + _increment;/** Setting the registration point of scale for slider value greater than 50 */
	}
	getChild("scale").regY = registration_point_y;
	/** Setting the nut and clamp on the top of scale */
 	compound_pendulam_stage.setChildIndex(getChild("nut_and_clamp"), compound_pendulam_stage.getNumChildren()-1)
	pendulum_length = scope.length/5;
	if ( scope.length == 50 ) {
		pendulum_length = 500;
		_length_in_meter = 0;
	} else {
	 _length_in_meter =  Math.abs(half_length-(pendulum_length*5))/100;
	}
	/** Equation to find the Moment of Inertia */
	//M.I= m*k^2+m*l^2 	, where 'm' is the mass, 'l' isDistance between center of gravity and pivot point in meter and k=0.25 m
	var _moment_of_inertia = mass * (Math.pow(scope.gyration, 2)) + mass *(Math.pow(_length_in_meter, 2));
	scope.inertia = _moment_of_inertia.toFixed(5);
	}

/** Function to stop the experiment */
function stopExperiment(scope) {
	resetWatch();
	pause_flag = false;
	scope.dropdown_disable = false;
	clearInterval(rotate_timer);
	getChild("scale").rotation = 0;
}
/** Createjs stage updation happens in every interval */
function updateStage() {
    compound_pendulam_stage.update();
}
/** All the texts loading and added to the stage */
function setText(name, textX, textY, value, color, fontSize) {
    var text = new createjs.Text(value, "bold " + fontSize + "em Tahoma, Geneva, sans-serif", color);
    text.x = textX;
    text.y = textY;
    text.textBaseline = "alphabetic";
    text.name = name;
    text.text = value;
    text.color = color;
	/** Adding text to the stage */
    compound_pendulam_stage.addChild(text); 
}

/** All the images loading and added to the stage */
function loadImages(image, name, xPos, yPos, cursor, rot, alpha_value, container) {
	registration_point_y = 21.5;
    var _bitmap = new createjs.Bitmap(image).set({});
    _bitmap.x = xPos;
    _bitmap.y = yPos;
    _bitmap.name = name;
    _bitmap.alpha = alpha_value;
    _bitmap.rotation = rot;
    _bitmap.cursor = cursor;
	if ( name == "scale" ) {
		_bitmap.regX = _bitmap.image.width/2.5;
		_bitmap.regY = registration_point_y; //initial registration point
	}
    container.addChild(_bitmap); /** Adding bitmap to the stage */
}

/** All variables initialising in this function */
function initialisationOfVariables(scope) {
    /**array that stores different value for different environments in the dropdown  */
    environment_value_Array = [9.8, 1.62, 9.01, 11.28, 25.93, 8.87, 3.70];
	scope.length = 5;
	radius_of_gyration = 25;
	half_length = 50;
	theta = omega = 0;
	updateCount = time_since_last_step = t1 = 0;
	pendulum_length =r = mass = 1;
	gravity = 9.8;
	drag = .05;
	scope.types_environment = 0;
	pendulam_drag_flag = true;
	pendulam_rotation_flag = false;
	scope.dropdown_disable = false;
	scope.result_disable = true;
	pause_flag = false;
}