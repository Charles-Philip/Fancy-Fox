let yoga_model;
let our_json_file = "data/yogi_data_v2.json";

function setup() {
  createCanvas(640, 480);
  let options = {
    inputs: 34,
    outputs: 3,
    task: 'classification',
    debug: true,
  }
  yoga_model = ml5.neuralNetwork(options);
  yoga_model.loadData(our_json_file, dataReady);
}

function dataReady() {
  yoga_model.normalizeData();
  yoga_model.train({epochs: 50}, finished); 
}

function finished() {
  console.log('model trained');
  yoga_model.save();
}