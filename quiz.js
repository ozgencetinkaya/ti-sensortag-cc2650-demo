var quiz = [{
  "question": "What is the full form of IP?",
  "choices": ["Internet Protocol","Internet Provider", "Internet Port"],
  "correct": "Internet Protocol"
}, {
  "question": "Who is the founder of Microsoft?",
  "choices": ["Bill Gates", "Steve Jobs", "Steve Wozniak"],
  "correct": "Bill Gates"
}, {
  "question": "1 byte = ?",
  "choices": ["8 bits", "64 bits", "1024 bits"],
  "correct": "8 bits"
}, {
  "question": "The C programming language was developed by?",
  "choices": ["Brendan Eich", "Dennis Ritchie", "Guido van Rossum"],
  "correct": "Dennis Ritchie"
}, {
  "question": "What does CC mean in emails?",
  "choices": ["Carbon Copy", "Creative Commons", "other"],
  "correct": "Carbon Copy"
}];




// init vars
var currentQuestion = 0,
  score = 0,
  askingQuestion = true;

var userscore = [0,0,0];  
  
function $(id) { // shortcut for document.getElementById
  return document.getElementById(id);
}

// define elements
/*var content = $('content'),
  questionContainer = $('question'),
  choicesContainer = $('choices'),
  scoreContainer = $('score'),
  submitBtn = $('submit');
 */
var content = document.getElementById('content');
var questionContainer = document.getElementById('question');
var choicesContainer = document.getElementById('choices');
var scoreContainer = document.getElementById('score');
 
function askQuestion() {
  if(!gameStopped)
  {
	  var choices = quiz[currentQuestion].choices,
		choicesHtml = "";

	  // loop through choices, and create radio buttons
	  for (var i = 0; i < choices.length; i++) {
		/*choicesHtml += "<input type='radio' name='quiz" + currentQuestion +
		  "' id='choice" + (i + 1) +
		  "' value='" + choices[i] + "'>" +
		  " <label for='choice" + (i + 1) + "'>" + choices[i] + "</label><br>";
		  */
		 choicesHtml += "<span>"+"Button"+(i+1)+" : "+choices[i]+"</span><br>"; 
	  }

	  questionContainer = $('question');
	  // load the question
	  questionContainer.textContent = "Q" + (currentQuestion + 1) + ". " +
		quiz[currentQuestion].question;

	  choicesContainer = $('choices');
	  // load the choices
	  choicesContainer.innerHTML = choicesHtml;

	  scoreContainer = $('score');
	  // setup for the first time
	  if (currentQuestion === 0) {
		scoreContainer.textContent = "Score: 0 right answers out of " +
		  quiz.length + " possible.";
	  }
  }
}

function checkAnswer() {
	var userpick  = answer-1;
	console.log("USer Answer "+userpick);
  // are we asking a question, or proceeding to next question?
  if(!gameStopped)
  {
	  if (askingQuestion) {
		// button for debug  
		//submitBtn.textContent = "Next Question";
		askingQuestion = false;

		// setup if they got it right, or wrong
		if (quiz[currentQuestion].choices[userpick] == quiz[currentQuestion].correct) {
			app.updateGameStatus('Correct...');
			console.log('Correct');
		  score++;
		  userscore[answeringuser]++;
		} else {
			app.updateGameStatus('Wrong...');
			console.log('Wrong');
		}
		//next question
		keypressBuffer = 4;
		keypressOrder = -1;
		app.count(checkAnswer,2,0);
		scoreContainer = $('score');
		scoreContainer.textContent = "Score: " + score + " right answers out of " +
		  quiz.length + " possible.";
		  
	  } else { // move to next question
		// setting up so user can ask a question
		askingQuestion = true;
		//Debug on PC browser
		// change button text back to "Submit Answer"
		//submitBtn.textContent = "Submit Answer";
		// if we're not on last question, increase question number
		if (currentQuestion < quiz.length - 1) 
		{
			currentQuestion++;
			app.updateGameStatus('Next Question...');
			app.setBackgroundColorDefault();
			app.clearAnswer();
			questionAsked = false;
			app.count(askQuestion,3,1); 
		}
		else 
		{
			app.updateGameStatus('Game ended...');
			console.log('Game ends..');
			gameStopped = true;
			console.log('Game ended..'+userscore[0]);
			console.log('Game ended..'+userscore[1]);
			console.log('Game ended..'+userscore[2]);
			showFinalResults()
		}
		//app.count(askQuestion,3,1); 
	  }
  }
}

function showFinalResults() {
	content = $('content');
  content.innerHTML = "<h2>You've complited the quiz!</h2>" +
    "<h2>Below are your results:</h2>";
	for(var i=0;i<userscore.length;i++)
	{
		content.innerHTML = content.innerHTML + "<h2>User "+app.UserColors[i] +" : "+ userscore[i] + " out of " + quiz.length + " questions, " +
		Math.round(userscore[i] / quiz.length * 100) + "%<h2>";
	}
}

//Debug methods for PC browser
//window.addEventListener("load", askQuestion, false);
//submitBtn.addEventListener("click", checkAnswer, false);