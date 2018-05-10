(function($){

    $(".submit1").click((e)=>{
        const player1Name = $(".name1").val();
        $(".player1name").text(player1Name);
        
        $.ajax({
            type: "POST",
            url: "http://localhost:3000/room/1/players/" + player1Name,
            success: function () {
                console.log("Done");
            },
            error: function () {
                console.log("Error");
            }       
        });
    })

    $(".submit2").click((e)=>{
        const player2Name = $(".name2").val();
        $(".player2name").text(player2Name);
        $.ajax({
            type: "POST",
            url: "http://localhost:3000/room/1/players/" + player2Name,
            success: function () {
                console.log("Done");
            },
            error: function () {
                console.log("Error");
            }       
        });
    })    
    
    let player1PreviousResults = [];
    let player2PreviousResults = [];

    const player1DrawBtnId = 'draw-btn1';
    const player1StayBtnId = 'stay-btn1';
    const player1ScoreId = 'score-player1';
    const player1DrawBtnElement = document.getElementById(player1DrawBtnId);
    const player1StayBtnElement = document.getElementById(player1StayBtnId);
    const player1ScoreElement= document.getElementById(player1ScoreId);

    const player2DrawBtnId = 'draw-btn2';
    const player2StayBtnId = 'stay-btn2';
    const player2ScoreId = 'score-player2';
    const player2ScoreElement = document.getElementById(player2ScoreId);
    const player2DrawBtnElement =  document.getElementById(player2DrawBtnId);
    const player2StayBtnElement = document.getElementById(player2StayBtnId);

    window.startNewGame = startNewGame;
    window.draw = draw;
    window.stay = stay;

    function startNewGame(){
        $.ajax({
            type: "POST",
            url: "http://localhost:3000/room/1/reset",
            success: function (data) {
                console.log(data);
            },
            error: function () {
                console.log("Error");
            }       
        })

        player1PreviousResults = [];
        player2PreviousResults = [];
    
        player1ScoreElement.innerHTML = 0;
        player2ScoreElement.innerHTML = 0;
    }

    function draw(player){
        if(player === 1){
            play(player1PreviousResults, player);
        }
        else{
            play(player2PreviousResults, player);
        }
    }

    function stay(player){
        if(player === 1){
            player1ToggleDisabled();
        }
        else{
            player2ToggleDisabled();
        }
    }

    function player1ToggleDisabled(){
        player1StayBtnElement.disabled = true;
        player1DrawBtnElement.disabled = true;
        player2DrawBtnElement.disabled = false;
        player2StayBtnElement.disabled = false;
    }

    function player2ToggleDisabled(){
        player2DrawBtnElement.disabled = true;
        player2StayBtnElement.disabled = true;
        player1StayBtnElement.disabled = false;
        player1DrawBtnElement.disabled = false;
    }

    function play(previousResults, player){
        let playerName;
        if(player === 1){
             playerName = $(".player1name").text();
        }
        else{
            playerName = $(".player2name").text();
        }
        $.ajax({
            type: "GET",
            url: "http://localhost:3000/room/1/players/"+playerName+"/draw",
            success: function (data) {
                previousResults.push(data.value);
                let sum = 0;
                previousResults.forEach((result)=>{
                    sum += result;
                });
                if(player === 1){
                    player1ScoreElement.innerHTML = sum;
                    player1ToggleDisabled();
                }
                else{
                    player2ScoreElement.innerHTML = sum;
                    player2ToggleDisabled();
                }
            },
            error: function (data) {
                const roomStatus = data.responseJSON.roomStatus;
                const playersScores = roomStatus.map((player)=>{
                    if(player.score > 21){
                        return `${player.name} score: ${player.score} Burned!`;
                    }
                    else if(player.score === 21){
                        return `${player.name} score: ${player.score} Blackjack!`;
                    }
                    else{
                        return `${player.name} score: ${player.score}` 
                    }
                })
                alert(playersScores.join("  ") + " Let's play again");
                startNewGame();
            }       
        })
    }
})(jQuery)