let model_file = "yogi_v2/yogi_model_v2.json";
let model_meta_file = "yogi_v2/yogi_model_meta_v2.json";
let model_weights_bin = "yogi_v2/yogi_model_v2.weights.bin";


let video;
let poseNet;
let pose;
let skeleton;
let posesArray = ["Tree", "Goddess", "Warrior II"];
var image_Array = new Array();
let labels_arr = ['T', 'G', 'W'];

let yoga_model;
let pose_Lab;
let str_time;
var errorCounter;
var frameCounter;
var poseCounter;
var target;
var desired_conf;
var max_time;
var time;
var canvas;

/*
function centerCanvas() {
    var x = (windowWidth - width) / 2;
    var y = (windowHeight - height) / 2;
    canvas.position(x, y);
}

function windowResized() {
    centerCanvas();
}
*/
function setup() {
    canvas = createCanvas(640, 480);
    //centerCanvas();

    canvas.position(0, 90);
//     rectMode(CENTER);
    //video = createCapture(VIDEO);
//     video.size(640, 480);
    video.hide();
    poseNet = ml5.poseNet(video, modelLoaded);
    poseNet.on('pose', gotPoses);

    for (let idx = 0; idx < 3; idx++) 
    {
  
      image_Array[idx] = new Image();
      image_Array[idx].src = 'images/' + posesArray[idx] + ".png";
    }

    max_time = 20; //20 secs
    desired_conf = 0.70; // 70% confidence level


    poseCounter = 0;
    errorCounter = 0;
    frameCounter = 0;

    time = (max_time - frameCounter);

    target = posesArray[poseCounter];
    document.getElementById("target_pose").textContent = target;

    let str_time = (time < 10 ? "00:0" : "00:") + time + " remaining";
    document.getElementById("timer").textContent = str_time;
  
    let imag = image_Array[poseCounter].src;
    document.getElementById("pose_image").src = imag;
  
  
    let options = {
        inputs: 34,
        outputs: 3,
        task: 'classification',
        debug: true
    }

    yoga_model = ml5.neuralNetwork(options);
    const modelInfo = {
        model: model_file,
        metadata: model_meta_file,
        weights: model_weights_bin,
    };
    yoga_model.load(modelInfo, yoga_modelLoaded);
}



function yoga_modelLoaded() {
    console.log("Model ready!");
    classifyPose();
}

function classifyPose() {
    if (pose) {
        let inputs = [];
        for (let idx = 0; idx < pose.keypoints.length; idx++) {
            let x = pose.keypoints[idx].position.x;
            let y = pose.keypoints[idx].position.y;
            inputs.push(x);
            inputs.push(y);
        }
        yoga_model.classify(inputs, gotResult);
    } else {
        console.log("No Pose found: retrying");
        setTimeout(classifyPose, 100);
    }
}

function gotResult(error, results) 
{
   
    if (results[0].confidence > 0.70)
    {
        console.log("Confidence: " + results[0].confidence);
        if (results[0].label.toUpperCase() == labels_arr[poseCounter].toString())
        {
            if(results[0].label.toUpperCase() == "T")
                pose_Lab = "Tree";
            else if(results[0].label.toUpperCase() == "G")
                pose_Lab = "Goddess";
            else if(results[0].label.toUpperCase() == "W")
                pose_Lab = "Warrior II";
            else
                pose_Lab = "Error"; // no label
        
            console.log("Pose Detected: " + pose_Lab);

            console.log("Label Detected: " + labels_arr[poseCounter]);
            frameCounter = frameCounter + 1;
            console.log("Count at: " + frameCounter)
            if (frameCounter == max_time) 
            {
                console.log("end of counter")
                frameCounter = 0;
                LoadNextPose();
            }
            else 
            {
                console.log("Target pose performed")
                time = time - 1;
                let str_time = (time < 10 ? "00:0" : "00:") + time + " remaining";
                document.getElementById("timer").textContent = str_time;
                setTimeout(classifyPose, 1000);
            }
        }
        else 
        {
            errorCounter = errorCounter + 1;
            console.log("Error");
            if (errorCounter >= 15) 
            {
                console.log("Too many errors: " + errorCounter+ " restarting counter and timer");
                time = max_time;
                let str_time = (time < 10 ? "00:0" : "00:") + time + " remaining";
                document.getElementById("timer").textContent = str_time;
                errorCounter = 0;
            } 
                setTimeout(classifyPose, 100);
        }
    }
    else 
    {
        console.log("No pose detected")
        setTimeout(classifyPose, 100);
    }
}


function gotPoses(poses) {
    if (poses.length > 0) {
        pose = poses[0].pose;
        skeleton = poses[0].skeleton;
    }
}

function modelLoaded() {
    console.log('poseNet ready');
}

function draw() {
    push();
    translate(video.width, 0);
    scale(-1, 1);
    image(video, 0, 0, video.width, video.height)
    image(video, 0, 0);
    if (pose) {
        for (let i = 0; i < pose.keypoints.length; i++) 
        {
            let x = pose.keypoints[i].position.x;
            let y = pose.keypoints[i].position.y;
            fill(0, 255, 0);
            ellipse(x, y, 9, 9);
        }
        for (let i = 0; i < skeleton.length; i++) 
        {
            let pt1 = skeleton[i][0];
            let pt2 = skeleton[i][1];
            strokeWeight(1);
            stroke(255);
            line(pt1.position.x, pt1.position.y, pt2.position.x, pt2.position.y);
        }
    }
    pop();
    fill(255, 0, 255);
}



function LoadNextPose() 
{

    if (poseCounter >= 2) 
    {
        console.log("End of poses: restarting");
        poseCounter = 0;
        errorCounter = 0;
        frameCounter = 0;
    } 
    else 
    {
        console.log("Next Pose");
        poseCounter = poseCounter + 1;
        errorCounter = 0;
        frameCounter = 0;
    }
  
        target = posesArray[poseCounter];
        document.getElementById("target_pose").textContent = target;

        time = (max_time - frameCounter);
        let str_time = (time < 10 ? "00:0" : "00:") + time + " remaining";
        document.getElementById("timer").textContent = str_time;

        let imag = image_Array[poseCounter].src;
        document.getElementById("pose_image").src = imag;  
  
        console.log("Loading Next Pose");

        console.log("Next pose: target label " + labels_arr[poseCounter]);
        console.log("Next pose: target pose " + target);
        setTimeout(classifyPose, 100);
    
}

