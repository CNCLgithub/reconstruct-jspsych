/*
 * Requires:
 *     psiturk.js
 *     utils.js
 *     instrunctions.js
 *     static/data/condlist.json
 */


// Initalize psiturk object
var psiTurk = new PsiTurk(uniqueId, adServerLoc, mode);

// Define global experiment variables
var N_TRIALS = 16;
var EXP_DURATION = 20;

// Debug Variables
var SKIP_PROLIFIC_ID = false;
var SKIP_INSTRUCTIONS = true; // variable doesn't work atm -- chloë 01/20/2023

const baseRoom = `
wwwwwwwwwwwwwwww
w              w
w              w
w              w
w              w
w              w
w              w
w              w
w              w
w              w
w              w
wb            bw
wbb          bbw
wbbb        bbbw
bbbbb      bbbbb
bbbbbbbBbbbbbbbb
`.toLowerCase().replace(/ /g, "0").split("\n").filter(e => e).map(row => Array.from(row))

// //! Ensuring that these locations are marked as entrance/exit
baseRoom[baseRoom.length - 1][7] = "e"

// All pages to be loaded
var pages = [
    "trial.html",
    "postquestionnaire.html",
    "experiments/grid.html",
];

const init = (async () => {
    await psiTurk.preloadPages(pages);
})()

psiTurk.preloadPages(pages);

const IMAGE_PATH = `/static/data/images`;
const STIM_IMAGES = `${IMAGE_PATH}/stims`;
const OBSTACLE_IMAGES = `${IMAGE_PATH}/obstacles`
const STIM_IMAGE_W = 720;
const STIM_IMAGE_H = 480;

/**************
 * Experiment *
 **************/
const CONDITIONS = {
    0: {
        exits: [],
        baseImage: "empty_no_door.png",
    }, // No exit
    1: {
        exits: [4],
        baseImage: "empty_left_door.png",
    }, // Exit on the left
    2: {
        exits: [11],
        baseImage: "empty_right_door.png",
    }, // Exit on the right
}

const setExits = (room, exits = []) => {
    room[0] = room[0].map((cell, index) => exits.includes(index) ? "x" : "w");
    // room[1] = room[1].map((cell, index) => exits.includes(index) ? "x" : "w"); // uncomment for 32x32 room
    return room;
}

const makeImageGridPair = (jsPsych, gridHTML, {
    roomID,
    stimImage,
    condition,
    isExample = false,
}) => {
    const {
        exits,
        baseImage
    } = CONDITIONS[condition];
    const room = setExits(Array.from(baseRoom), exits);
    const prefix = isExample ? "example" : "trial";

    // stimulus trial
    const image = {
        type: jsPsychImageKeyboardResponse,
        stimulus: `${STIM_IMAGES}/${stimImage}`,
        maintain_aspect_ratio: true,
        stimulus_height: STIM_IMAGE_H,
        stimulus_width: STIM_IMAGE_W,
        render_on_canvas: false,
        choices: "NO_KEYS",
        trial_duration: 750,
        post_trial_gap: 250, // duration between trials
        data: {
            // add any additional data that needs to be recorded here
            type: `${prefix}_image`,
        },
        on_start: (trial) => {
            const scaleFactor = jsPsych.data.get()
                .filter({
                    type: "cc_scale"
                })
                .first(1)
                .select("scale_factor")
                .values[0] || 1;
            trial.stimulus_width = STIM_IMAGE_W * scaleFactor;
            trial.stimulus_height = STIM_IMAGE_H * scaleFactor;
            console.log(`${prefix}_image ->`, {
                scaleFactor,
                width: trial.stimulus_width,
                height: trial.stimulus_height
            })
            return trial;
        }
    };

    const grid = {
        type: jsPsychVslGridAlt,
        html: gridHTML,
        cellSize: 25,
        baseImage: `${STIM_IMAGES}/${baseImage}`,
        room,
        isExample,
        imagePath: `${OBSTACLE_IMAGES}`,
        data: {
            // add any additional data that needs to be recorded here
            type: `${prefix}_grid`,
            exit: condition,
            scene_id: roomID,

        }
    };

    return [image, grid];
}

// jsPsych needs to be passed in to access the previous trial data
var Experiment = function (jsPsych, condition_list, trials) {
    // empty html template for jsPsych to use
    psiTurk.showPage('trial.html');
    const gridHTML = psiTurk.getPage("experiments/grid.html");
    const wrappedMakeImageGridPair = (args) => makeImageGridPair(jsPsych, gridHTML, args)

    const control_list = condition_list[1].slice(0, N_TRIALS)
    condition_list = condition_list[0]

    var left_exit = []
    var right_exit = []

    for (const condition of condition_list) {
        const exit_location = condition[condition.length - 1];
        const exit_list = exit_location == 1 ? left_exit : right_exit;
        exit_list.push(condition);
    }

    left_exit = left_exit.slice(0, N_TRIALS)
    right_exit = right_exit.slice(0, N_TRIALS)

    condition_list = left_exit.concat(right_exit).concat(control_list)

    // shuffle conditions
    condition_list = shuffle(condition_list);

    // all images are used in standard trials that can be automatically preloaded (as well as being used in trials 
    // that use timeline variables), so we can preload all image files with the auto_preload option
    var preload = {
        type: jsPsychPreload,
        auto_preload: true,
    };

    trials.push(preload);

    var enter_fullscreen = {
        type: jsPsychFullscreen,
        fullscreen_mode: true
    };

    trials.push(enter_fullscreen);

    // ask for participant ID
    var prolific_id = {
        type: jsPsychSurveyText,
        questions: [{
            prompt: 'What is your Prolific ID?',
            required: true
        }],
        data: {
            // add any additional data that needs to be recorded here
            type: "prolific_id",
        }
    };
    // add the following trial pages to be displayed in their respective order
    if (!SKIP_PROLIFIC_ID) {
        trials.push(prolific_id);
    };

    // ---------------------
    //      welcome page    
    // ---------------------
    var welcome = {
        type: jsPsychInstructions,
        pages: [
            `<h1>Hi, welcome to our study!</h1><br><br> ` +
            `Please take a moment to adjust your seating so that you can comfortably watch the monitor and use the keyboard/mouse.<br> ` +
            `Feel free to dim the lights as well.  ` +
            `Close the door or do whatever is necessary to minimize disturbance during the experiment. <br> ` +
            `Please also take a moment to silence your phone so that you are not interrupted by any messages mid-experiment. ` +
            `<br><br> ` +
            `Click <b>Next</b> when you are ready to continue. `,
        ],
        show_clickable_nav: true,
        allow_backward: false,
        data: {
            // add any additional data that needs to be recorded here
            type: "welcome",
        }
    };

    trials.push(welcome)
    // ---------------------
    var cc_scale = {
        type: jsPsychResize,
        item_width: 480, // 3 + 3 / 8,
        item_height: 288, // 2 + 1 / 8,
        starting_size: 384,
        prompt: `<p>Please sit comfortably in front of you monitor and outstretch your arm holding a credit card (or a similary sized ID card).</p> <p>Click and drag the lower right corner of the box until the box is the same size as a credit card held up to the screen.</p> `,
        pixels_per_unit: 1,
        data: {
            type: "cc_scale"
        },
        on_finish: (data) => {
            document.querySelector("#jspsych-content").style.removeProperty("transform");
        }
    };

    trials.push(cc_scale);

    // ---------------------
    //      instructions    
    // ---------------------
    var instructions = {
        type: jsPsychInstructions,
        pages: [
            `The study is designed to be <i>challenging</i>. Sometimes, you'll be certain about what you saw. Other times, you won't be -- and this is okay! Just give your best guess each time. <br><br>` + `Click <b>Next</b> to continue.`,
            `We know it is also difficult to stay focused for so long, especially when you are doing the same thing over and over. But remember, the experiment will be all over in less than ${EXP_DURATION} minutes. <br>` + `There are <strong>${3 * N_TRIALS} trials</strong> in this study. <br>` + `Please do your best to remain focused! Your responses will only be useful to us if you remain focused. <br><br>` + `Click <b>Next</b> to continue.`,
            `In this study, you will briefly see an image and then asked to reconstruct what you saw. <br>` +
            `After the image dissapears, click on the grid to re-assemble the image you previously saw. <br> <br>` +
            `Click <b>Next</b> to continue.`,
            `Your task is to re-assemble the image. <br>` +
            `<strong>The next screen will be a demonstration trial.</strong> <br>` +
            `Please take the time to familiarize yourself with the interface during the demonstration. <br><br>` +
            `Click <b>Next</b> when you are ready to start the demonstration.`,
        ],
        show_clickable_nav: true,
        show_page_number: true,
        page_label: "<b>Instructions</b>",
        allow_backward: false,
    };
    // ---------------------

    // ---------------------
    //        examples      
    // ---------------------

    const exampleImage = "30_2.png";
    const exampleImageRooms = wrappedMakeImageGridPair({
        roomID: 30,
        stimImage: exampleImage,
        condition: 2,
        isExample: true
    });

    // ---------------------

    // ---------------------
    // comprehension check  
    // ---------------------
    // questions
    var comp_check = {
        type: jsPsychSurveyMultiChoice,
        preamble: "<h2>Comprehension Check</h2>",
        questions: [{
                prompt: "In this experiment you will press the <strong>Erase</strong> button to <strong>add boxes</strong> to an empty scene using a grid.",
                name: 'check1',
                options: ['True', "False"],
                required: true
            },
            {
                prompt: "Your task for this experiment is to <strong>place boxes to reconstruct an image</strong> in an empty scene using a grid.",
                name: 'check2',
                options: ['True', "False"],
                required: true
            },
        ],
        randomize_question_order: true,
        on_finish: function (data) {
            var q1 = data.response.check1;
            var q2 = data.response.check2;

            // set to true if both comp checks are passed
            data.correct = (q1 == 'False' && q2 == "True") ? true : false;
        },
        data: {
            // add any additional data that needs to be recorded here
            type: "comp_quiz",
        }
    };


    // feedback
    var comp_feedback = {
        type: jsPsychHtmlButtonResponse,
        stimulus: function () {
            var last_correct_resp = jsPsych.data.getLastTrialData().values()[0].correct;

            if (last_correct_resp) {
                return `<span style='color:green'><h2>You passed the comprehension check!</h2></span> ` + `<br>When you're ready, please click <b>Next</b> to begin the study. `
            } else {
                return `<span style='color:red'><h2>You failed to respond <b>correctly</b> to all parts of the comprehension check.</h2></span> ` + `<br>Please click <b>Next</b> to revisit the instructions. `
            }
        },
        choices: ['Next'],
        data: {
            // add any additional data that needs to be recorded here
            type: "comp_feedback",
        }
    };

    // `comp_loop`: if answers are incorrect, `comp_check` will be repeated until answers are correct responses
    var comp_loop = {
        timeline: [
            instructions,
            ...exampleImageRooms,
            comp_check,
            comp_feedback
        ],
        loop_function: function (data) {
            // check if `comp_check` was passed, break loop 
            return (data.values()[3].correct) ? false : true;
        }
    };

    trials.push(comp_loop);
    // ---------------------

    // ---------------------
    //        trials        
    // ---------------------
    for (const trial of condition_list) {
        const [roomID, stimImage, condition] = trial;

        const imageRoomPair = wrappedMakeImageGridPair({
            roomID,
            stimImage,
            condition,
        });

        // display grid
        trials.push(...imageRoomPair);
    }
    // ---------------------


    // ---------------------
    //       end page        
    // ---------------------
    var end_trial = {
        type: jsPsychHtmlButtonResponse,
        stimulus: `<h2><b>Thank you for helping us with our study! :) </b></h2><br><br> ` +
            `Click <b>Done</b> to submit your responses. <br> `,
        choices: ['<b>Done</b>'],
    };
    var exit_fullscreen = {
        type: jsPsychFullscreen,
        fullscreen_mode: false,
        delay_after: 0
    };
    // display end message
    trials.push(end_trial, exit_fullscreen);
    // ---------------------
};


/*******************
 * Run Task
 ******************/

$(window).on('load', async () => {
    await init;

    function run_experiment() {
        $.ajax({
            dataType: 'json',
            url: "static/data/condlist.json",
            async: false,
            success: function (data) {
                condition_list = data;
                // condition_list = condition_list.slice(0, N_TRIALS);
                var trials = [];

                var jsPsych = initJsPsych({
                    show_progress_bar: true,
                    on_trial_finish: function () {
                        // record data for psiturk database after every trial
                        psiTurk.recordTrialData(jsPsych.data.getLastTrialData());
                        // psiTurk.recordUnstructuredData(jsPsych.data.getLastTrialData());
                    },
                    on_finish: function () {
                        new Questionnaire();
                        // save all recorded data to psiturk database
                        psiTurk.saveData();
                        // console.log("filtered ->", jsPsych.data.get().filter({type: "trial_grid"}))
                    }
                });

                Experiment(jsPsych, condition_list, trials);
                jsPsych.run(trials);
            }
        });

    };

    if (isMobileTablet()) {
        console.log("mobile browser detected");
        alert(`Sorry, but mobile or tablet browsers are not supported. Please switch to a desktop browser or return the hit.`);
        return;
    }

    run_experiment();
});


// ? might be getting used for this exp? -- chloë 01/20/2023
// only needed if you want a post-questionnnaire
/****************
 * Questionnaire *
 ****************/

var Questionnaire = function () {

    var error_message = "<h1>Oops!</h1><p>Something went wrong submitting your HIT. This might happen if you lose your internet connection. Press the button to resubmit.</p><button id='resubmit'>Resubmit</button>";

    record_responses = function () {

        psiTurk.recordTrialData({
            'phase': 'postquestionnaire',
            'status': 'submit'
        });

        $('textarea').each(function (i, val) {
            psiTurk.recordUnstructuredData(this.id, this.value);
        });
        $('select').each(function (i, val) {
            psiTurk.recordUnstructuredData(this.id, this.value);
        });

    };

    prompt_resubmit = function () {
        document.body.innerHTML = error_message;
        $("#resubmit").click(resubmit);
    };

    resubmit = function () {
        document.body.innerHTML = "<h1>Trying to resubmit...</h1>";
        reprompt = setTimeout(prompt_resubmit, 10000);

        psiTurk.saveData({
            success: function () {
                clearInterval(reprompt);
                psiTurk.computeBonus('compute_bonus', function () {
                    finish()
                });
            },
            error: prompt_resubmit
        });
    };

    // Load the questionnaire snippet
    psiTurk.showPage('postquestionnaire.html');
    psiTurk.recordTrialData({
        'phase': 'postquestionnaire',
        'status': 'begin'
    });

    $("#next").click(function () {
        record_responses();
        psiTurk.saveData({
            success: function () {
                psiTurk.completeHIT(); // when finished saving compute bonus, the quit
                //window.location.replace(PROLIFIC_RETURN_URL); // redirecting back to Prolific
            },
            error: prompt_resubmit
        });
    });


};