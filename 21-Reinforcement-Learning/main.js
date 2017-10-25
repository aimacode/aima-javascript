const init_pol_eval_vis = function(){
    // Init Env
    const env_args = {
        grid: [
            [-0.04, -0.04, -0.04, +1],
            [-0.04, null,  -0.04, -1],
            [-0.04, -0.04, -0.04, -0.04]
        ],
        orientations: [0, 1, 2, 3].map(d => new MDP.Heading(d)),
        terminals: [{x:0, y:3}, {x:1, y:3}],
        init: {x:0, y:0},
        gamma: 1.0
    };
    const env = new MDP.GridWorld(env_args);
    
    // Init Policy
    const policy  = {
        2: {0:new MDP.Heading(1),1:new MDP.Heading(2),2:new MDP.Heading(2),3:new MDP.Heading(2)},
        1: {0:new MDP.Heading(1),2:new MDP.Heading(1)},
        0: {0:new MDP.Heading(0),1:new MDP.Heading(0),2:new MDP.Heading(0)}
    };
    
    // State Values
    const U = [
        [0,0,0,+1],
        [0, null,0,-1],
        [0,0,0,0]
    ];
    
    const pe_cont = new PEController.Controller({
        canvas: d3.select('#canvas'),
        sliderbar: d3.select('#history'),
        env, policy, U,
        callbacks: []
    });
    
    return pe_cont;
}

$(document).ready(function(){
    $.ajax({
        url : "policyEvaluation.js",
        dataType: "text",
        success : function (data) {
            $("#policyEvaluationCode").html(data);
        }
    });
    
    const PEV = init_pol_eval_vis();
    $('#next').on("click tap", () => { PEV.next(); });
    $('#back').on("click tap", () => { PEV.back(); });
    $('#history').on('input onchange', (event) => { PEV.jump_to(parseInt(event.target.value)); });
    $('#animate').on("click tap", () => { PEV.animate(); });
    window.addEventListener('resize', () => { PEV.resize(); });
});