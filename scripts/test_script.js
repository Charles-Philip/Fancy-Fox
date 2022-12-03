let video;
let poseNet;
let pose;
let skeleton;

let yoga_model;
let poseLabel = "";

//let model_file = "yoga_model/yoga_model.json";
//let model_meta_file = "yoga_model/yoga_model_meta.json";
//let model_weights_bin = "yoga_model/yoga_model.weights.bin";

//let model_file = "yogi/yogi_model.json";
//let model_meta_file = "yogi/yogi_model_meta.json";
//let model_weights_bin = "yogi/yogi_model.weights.bin";

let model_file = "yogi_v2/yogi_model_v2.json";
let model_meta_file = "yogi_v2/yogi_model_meta_v2.json";
let model_weights_bin = "yogi_v2/yogi_model_v2.weights.bin";

function setup() {
  var cnv = createCanvas(640, 480);
  
  cnv.position(100, 200);
  
  video = createCapture(VIDEO);
  video.hide();
  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on('pose', gotPoses);

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
  console.log('pose classification ready!');
  classifyPose();
}

function classifyPose() {
  if (pose) {
    let inputs = [];
    for (let i = 0; i < pose.keypoints.length; i++) {
      let x = pose.keypoints[i].position.x;
      let y = pose.keypoints[i].position.y;
      inputs.push(x);
      inputs.push(y);
    }
    yoga_model.classify(inputs, gotResult);
  } else {
    setTimeout(classifyPose, 100);
  }
}

function gotResult(error, results) {
  var conf = results[0].confidence;
  console.log("results " + results);
  console.log("results[0] " + results[0]);
  console.log("results[0].label " + results[0].label);

  if(conf > 0.99)
    {
      poseLabel = "ERROR !";
    }
  else if (conf > 0.75) {
    console.log(results[0].confidence)
    var lab = results[0].label.toUpperCase()
    if(lab == "G")
      poseLabel = "Goddess";
    if(lab == "T")
      poseLabel = "Tree";
    if(lab == "W")
      poseLabel = "Warrior II";
  }
  classifyPose();
}

function gotPoses(this_pose) {
  if (this_pose.length > 0) {
    pose = this_pose[0].pose;
    skeleton = this_pose[0].skeleton;
  }
}


function modelLoaded() {
  console.log('poseNet ready');
}

function draw() {
  push();
  translate(video.width, 0);
  scale(-1, 1);
  image(video, 0, 0, video.width, video.height);

  if (pose) {
    for (let i = 0; i < skeleton.length; i++) {
      let pt1 = skeleton[i][0];
      let pt2 = skeleton[i][1];
      strokeWeight(1);
      stroke(255);

      line(pt1.position.x, pt1.position.y, pt2.position.x, pt2.position.y);
    }
    for (let i = 0; i < pose.keypoints.length; i++) {
      let x = pose.keypoints[i].position.x;
      let y = pose.keypoints[i].position.y;
      fill(0);
      stroke(255);
      ellipse(x, y, 16, 16);
    }
  }
  pop();

  fill(255, 0, 255);
  noStroke();
  textSize(512 / (2*2));
  textAlign(CENTER, TOP);
  text(poseLabel, width / 2, height / 2 );
}


  