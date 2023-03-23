jsPsych.plugins['custom-grid'] = (function(){

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('custom-grid', 'stimuli', 'image');

  plugin.info = {
    name: 'custom-grid',
    description: '',
    parameters: {
      stimuli: {
        type: jsPsych.plugins.parameterType.IMAGE,
        pretty_name: 'Stimuli',
        array: true,
        default: undefined,
        description: 'An array that defines a grid.'
      },
      image_size: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Image size',
        array: true,
        default: [100,100],
        description: 'Array specifying the width and height of the images to show.'
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: 2000,
        description: 'How long to show the stimulus for in milliseconds.'
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    display_element.innerHTML = plugin.generate_stimulus(trial.stimuli, trial.image_size);

    jsPsych.pluginAPI.setTimeout(function() {
      endTrial();
    }, trial.trial_duration);

    function endTrial() {

      display_element.innerHTML = '';

      var trial_data = {
        stimulus: trial.stimuli
      };

      jsPsych.finishTrial(trial_data);
    }
  };

  plugin.generate_stimulus = function(pattern, image_size) {
    var nrows = pattern.length;
    var ncols = pattern[0].length;

    var stimulus = "<div id='custom-grid' style='width:auto;height:auto;margin:auto; display: table; table-layout: fixed; border-collapse: collapse; margin-left: auto; margin-right: auto'>";
    for(var row = 0; row < nrows; row++){
      stimulus += "<div class='custom-grid-row' style='display:table-row;'>";
      for(var col = 0; col < ncols; col++){
        var classname = 'custom-grid-cell';

        stimulus += "<div class='" + classname + "' id='custom-grid-cell-" + row + "-" + col + "' " +
          "data-row=" + row + " data-column=" + col + " " +
          "style='width:auto; height:auto; display:table-cell; vertical-align:middle; border: 0px solid #eee;";
        stimulus += "'>";
        if (pattern[row][col] !== 0) {
            stimulus += '<img '+
                'src="' + pattern[row][col] + '" style="width: ' + image_size[0]+ 'px; height: ' + image_size[1] + ';"></img>';
        }
        stimulus += "</div>";
      }
      stimulus += "</div>";
    }
    stimulus += "</div>";

    return stimulus;
  };

  return plugin;
})();
