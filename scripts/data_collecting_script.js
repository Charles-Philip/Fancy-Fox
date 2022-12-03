let video;
let poseNet;
let pose;
let skeleton;

let yogi_pose_model;
let poseLabel = "";
let targetLabel = "";;
let state = "waiting";

function keyPressed() {
 if (key == 's') {
    yogi_pose_model.saveData();
  } else {
    targetLabel = key;
    console.log(targetLabel);
    setTimeout(function() {
      console.log('collecting');
      state = 'collecting';
      setTimeout(function() {
        console.log('not collecting');
        state = 'waiting';
      }, 5000);
    }, 5000);
  }
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.hide();
  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on('pose', gotPoses);

  let options = {
    inputs: 34,
    outputs: 3,
    task: "classification",
    debug: true
  }
  yogi_pose_model = ml5.neuralNetwork(options);
}

function gotPoses(this_pose) {
  if (this_pose.length > 0) {
    pose = this_pose[0].pose;
    skeleton = this_pose[0].skeleton;
    if (state == 'collecting') {
      let inputs = [];
      for (let idx = 0; idx < pose.keypoints.length; idx++) {
        let x = pose.keypoints[idx].position.x;
        let y = pose.keypoints[idx].position.y;
        inputs.push(x);
        inputs.push(y);
      }
      let target = [targetLabel];
      yogi_pose_model.addData(inputs, target);
}}}

function modelLoaded() {
  console.log('poseNet ready');
}

function draw() {
  translate(video.width, 0);
  scale(-1,1);
  image(video, 0, 0, video.width, video.height);
  
  if (pose) {
    for (let idx = 0; idx < skeleton.length; idx++) {
      let pt1 = skeleton[idx][0];
      let pt2 = skeleton[idx][1];
      strokeWeight(1);
      stroke(255);
      line(pt1.position.x, pt1.position.y, pt2.position.x, pt2.position.y);
    }
  }
  
}