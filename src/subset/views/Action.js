
/**
 * ACTION
 *
 */

var d3action_draw = false;
function d3action() {

    if(!d3action_draw) {
        d3action_draw = true;
        drawMainGraphAction();
    }
}


/**
 * Draw the main graph for Action
 *
 **/
var map_action_lookup = new Map();
var map_rootcode_lookup = new Map();
var arr_action_data = [];
var arr_rootcode_data = [];
var map_action_pid_pname = new Map();
var mapActionGraphSVG = new Object();
function drawMainGraphAction() {


    $("#subsetAction").append('<div class="container"><div id="subsetAction_panel" class="row"></div></div>');

    $("#subsetAction_panel").append("<div class='col-xs-4 location_left' id='subsetActionDivL'></div>");
    $("#subsetAction_panel").append("<div class='col-xs-4 location_right'><div class='affix' id='subsetActionDivR'></div></div>");

    $("#subsetActionDivL").append("<table id='svg_graph_table_action' border='0' align='center'><tr><td id='main_graph_action_td_1' class='graph_config'></td></tr><tr><td id='main_graph_action_td_2' class='graph_config'></td></tr></table>");

    //actionGraphLabel("main_graph_action_td_1");
    //actionGraphLabel("main_graph_action_td_2");

    var svg1 = d3.select("#main_graph_action_td_1").append("svg:svg")
        .attr("width",  480)
        .attr("height", 350)
        .attr("id", "main_graph_action_svg_1");

    var svg2 = d3.select("#main_graph_action_td_2").append("svg:svg")
        .attr("width",  480)
        .attr("height", 350)
        .attr("id", "main_graph_action_svg_2");

    mapActionGraphSVG["main_graph_action_1"] = svg1;
    mapActionGraphSVG["main_graph_action_2"] = svg2;

    renderActionGraph(svg1, 1);
    renderActionGraph(svg2, 2);


}

function getMapActionLookup() {

    d3.csv("data/actionlookup.csv", function(data) {

        data.forEach(function(d) {

            map_action_lookup.set(d.EventRootCode + "" , d.PentaClass + "");

            var obj = new Object();
            obj.EventRootCode = d.EventRootCode;
            obj.PentaClass = d.PentaClass;
            obj.Description = d.Description;

            var lst = [];
            if(map_rootcode_lookup.has(d.PentaClass)) {

                lst = map_rootcode_lookup.get(d.PentaClass)
            }
            lst.push(obj);
            map_rootcode_lookup.set(d.PentaClass, lst);

        });

        var itr = map_rootcode_lookup.keys();

        var key = itr.next();
        var id = -1;
        do {

            if (key.value != undefined) {
                var lst = map_rootcode_lookup.get(key.value+"");

                var obj = new Object();
                obj.PentaClass = key.value + "";
                obj.freq = lst.length;

                arr_rootcode_data[++id] = obj;
            }

            key = itr.next();

        }while(key.value != undefined);
    });
}

/**
 * actionGraphLabel - to put the header Labels in the main graph of Action
 *
 **/
function actionGraphLabel(tdId) {

    $("#"+tdId).append('<div id="main_graph_action_td_div"></div>');

    var label = $('<label align="right" id="EventRootCode">EventRootCode:</label>');

    var divId = tdId + "_div";

    $("#"+divId).append(label);
    $("#"+divId).append("&nbsp; &nbsp; &nbsp;");


    var label11 = $('<label title="Expand All" onclick = "javascript:actionGraphAction(\'All\')"><span class="glyphicon btn btn-default"><label style="cursor:pointer; text-align:center; width:60px;" align="right" id="Action_Main_All">All</label></span></label>');
    var label12 = $('<label title="Collapse All"  onclick = "javascript:actionGraphAction(\'None\')"><span class="glyphicon btn btn-default"><label style="cursor:pointer; text-align:center; width:60px;" align="right" id="Action_Main_None">None</label></span></label>');
    $("#"+divId).append(label11);
    $("#"+divId).append("&nbsp; &nbsp; &nbsp;");
    $("#"+divId).append(label12);
    $("#"+divId).append("&nbsp; &nbsp; &nbsp;");

    var label2 = $('<label align="right" id="Expand_Collapse_ACtion_Text" class="hide_label">Collapse</label>');
    $("#"+divId).append(label2);
    var label3 = $('<label style="cursor:pointer"  onclick = "javascript:actionGraphAction(\'Expand_Collapse\')"><span class="glyphicon glyphicon-resize-small btn btn-default" id="Action_Exp_Col_Icon"></span></label>');
    $("#"+divId).append(label3);

}

/**
 * render Action Graph
 * @param blnIsSubgraph
 * @param cid
 */
function renderActionGraph(svg, gid) {


    // console.log("Rendering Main Action Graph...");

    var maxDomainX = 1;

    var margin = {top: 20, right: 20, bottom: 30, left: 135},
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom;

    var x = d3.scaleLinear().range([0, width]);
    var y = d3.scaleBand().range([height, 0]);

    if (gid == 1) {

        d3.tsv("data/actionplot.tsv", getMapActionLookup(), function (data) {

            var pid = -1;
            data.forEach(function (d) {

                var eventRootCode = (d.RootCode).toString();
                var eventRootCode_2Ch = eventRootCode.length < 2 ? "0" + eventRootCode : eventRootCode.substr(0, 2);

                var pentaClass = "-1";

                if (map_action_lookup.has(eventRootCode_2Ch)) {

                    pentaClass = map_action_lookup.get(eventRootCode_2Ch) + "";
                }


                if (!map_action_pid_pname.has(pentaClass)) {

                    pid++;
                    var arr_data = [];
                    arr_data.push(d);

                    var pdata = new Object();
                    pdata.pid = pid;
                    pdata.pentaClass = pentaClass + "";
                    pdata.freq = parseInt(d.freq);
                    pdata.maxCFreq = parseInt(d.freq);
                    pdata.arr_data = arr_data;

                    arr_action_data[pid] = pdata;

                    map_action_pid_pname.set(pentaClass, pid);
                    map_action_pid_pname.set(pid, pentaClass);

                }
                else {

                    var currPid = map_action_pid_pname.get(pentaClass);
                    var pdata = arr_action_data[currPid];

                    var freq = pdata.freq + parseInt(d.freq);
                    pdata.freq = freq;
                    pdata.arr_data.push(d);

                    var cFreq = parseInt(d.freq);
                    if (cFreq > pdata.maxCFreq) {
                        pdata.maxCFreq = cFreq;
                    }

                    arr_action_data[currPid] = pdata;

                    if (freq > maxDomainX) {
                        maxDomainX = freq;
                    }
                }

            });


            x.domain([0, maxDomainX]);
            y.domain(arr_action_data.map(function (d) {
                return d.pentaClass;
            })).padding(0.1);

            var g = svg.append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            g.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x).ticks(5).tickFormat(function (d) {
                    return parseInt(d);
                }).tickSizeInner([-height]));

            g.append("g")
                .attr("class", "y axis")
                .call(d3.axisLeft(y));


            g.selectAll(".bar")
                .data(arr_action_data)
                .enter()
                .append("rect")
                .attr("class", "bar")
                .attr("x", 0)
                .attr("height", y.bandwidth())
                .attr("y", function (d) {
                    return y(d.pentaClass);
                })
                .attr("width", function (d) {
                    return x(d.freq);
                })
                .attr("onclick", function (d) {
                    mapActionGraphSVG[d.pid] = null;
                    return "javascript:alert('" + d.pid + "')";
                })
                .attr("id", function (d) {
                    return "tg_rect_action_" + d.pid;
                });

            g.selectAll(".bar_click")
                .data(arr_action_data)
                .enter()
                .append("rect")
                .attr("class", "bar_click")
                .attr("height", y.bandwidth())
                .attr("width", function (d) {
                    return width - x(d.freq);
                })
                .attr("x", function (d) {
                    return x(d.freq);
                })
                .attr("y", function (d) {
                    return y(d.pentaClass);
                })
                .attr("onclick", function (d) {
                    return "javascript:alert('" + d.pid + "')";
                });

            g.selectAll(".bar_label")
                .data(arr_action_data)
                .enter()
                .append("text")
                .attr("class", "bar_label")
                .attr("x", function (d) {
                    return x(d.freq) + 5;
                })
                .attr("y", function (d) {
                    return y(d.pentaClass) + y.bandwidth() / 2 + 4;
                })
                .text(function (d) {
                    return "" + d.freq;
                });

            g.append("text")
                .attr("text-anchor", "middle")
                .attr("transform", "translate(" + (-115) + "," + (height / 2) + ")rotate(-90)")
                .attr("class", "graph_axis_label")
                .text("PentaClass");


            g.append("text")
                .attr("text-anchor", "middle")
                .attr("transform", "translate(" + (width / 2) + "," + (height + 30) + ")")
                .attr("class", "graph_axis_label")
                .text("Frequency");


        });
    }

    else if (gid == 2) {


        d3.csv("data/actionlookup.csv", function (data) {

            x.domain([0, d3.max(data, function (d) {
                return d.freq;
            })]);
            y.domain(arr_rootcode_data.map(function (d) {
                return d.PentaClass + "";
            })).padding(0.1);

            var g = svg.append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            g.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x).ticks(5).tickFormat(function (d) {
                    return parseInt(d);
                }).tickSizeInner([-height]));

            g.append("g")
                .attr("class", "y axis")
                .call(d3.axisLeft(y));


            g.selectAll(".bar")
                .data(arr_rootcode_data)
                .enter()
                .append("rect")
                .attr("class", "bar")
                .attr("x", 0)
                .attr("height", y.bandwidth())
                .attr("y", function (d) {
                    return y(d.PentaClass);
                })
                .attr("width", function (d) {
                    return x(d.freq);
                });


            g.selectAll(".bar_click")
                .data(arr_rootcode_data)
                .enter()
                .append("rect")
                .attr("class", "bar_click")
                .attr("height", y.bandwidth())
                .attr("width", function (d) {
                    return width - x(d.freq);
                })
                .attr("x", function (d) {
                    return x(d.freq);
                })
                .attr("y", function (d) {
                    return y(d.PentaClass);
                });


            g.selectAll(".bar_label")
                .data(arr_rootcode_data)
                .enter()
                .append("text")
                .attr("class", "bar_label")
                .attr("x", function (d) {
                    return x(d.freq) + 5;
                })
                .attr("y", function (d) {
                    return y(d.PentaClass) + y.bandwidth() / 2 + 4;
                })
                .text(function (d) {
                    return "" + d.freq;
                });

            g.append("text")
                .attr("text-anchor", "middle")
                .attr("transform", "translate(" + (-115) + "," + (height / 2) + ")rotate(-90)")
                .attr("class", "graph_axis_label")
                .text("PentaClass");


            g.append("text")
                .attr("text-anchor", "middle")
                .attr("transform", "translate(" + (width / 2) + "," + (height + 30) + ")")
                .attr("class", "graph_axis_label")
                .text("Frequency");


        });
    }
}