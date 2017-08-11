// Date tab of subsetting screen
$("#dateSVG").empty();
// Default calendar ranges
var datemax = new Date();
var datemin = d3.timeYear.offset(datemax, -5);

// Stubs for user preference
var dateminUser = datemin;
var datemaxUser = datemax;

// Only true on page setup
var dateSetup = true;

// Stores brush dates
var plotSelection;


function createDateplot() {
    $("#dateSVG").empty();
    var dateSVG = d3.select("#dateSVG");

    margin = {top: 20, right: 20, bottom: 110, left: 30};
    margin2 = {top: 430, right: 20, bottom: 30, left: 30};
    datewidth = +dateSVG.attr("width") - margin.left - margin.right;
    dateheight = +dateSVG.attr("height") - margin.top - margin.bottom;
    dateheight2 = +dateSVG.attr("height") - margin2.top - margin2.bottom;

    // The date range needs to be transformed to image width. Range defined here, domain defined below
    // Range of X:
    var datex = d3.scaleTime().range([0, datewidth]),
        datex2 = d3.scaleTime().range([0, datewidth]),
        datey = d3.scaleLinear().range([dateheight, 0]),
        datey2 = d3.scaleLinear().range([dateheight2, 0]);

    var datexAxis = d3.axisBottom(datex),
        datexAxis2 = d3.axisBottom(datex2),
        dateyAxis = d3.axisLeft(datey);

    // Brush and zoom elements
    var datebrush = d3.brushX()
        .extent([[0, 0], [datewidth, dateheight2]])
        .on("brush end", brushed);

    var datezoom = d3.zoom()
        .scaleExtent([1, Infinity])
        .translateExtent([[0, 0], [datewidth, dateheight]])
        .extent([[0, 0], [datewidth, dateheight]])
        .on("zoom", zoomed);

    // Focus data element:
    var datearea = d3.area()
        .curve(d3.curveMonotoneX)
        .x(function (d) {
            return datex(d.Date);
        })
        .y0(dateheight)
        .y1(function (d) {
            return datey(d.Freq);
        });

    // Context data element:
    var datearea2 = d3.area()
        .curve(d3.curveMonotoneX)
        .x(function (d) {
            return datex2(d.Date);
        })
        .y0(dateheight2)
        .y1(function (d) {
            return datey2(d.Freq);
        });

    // Set the svg metadata:
    dateSVG.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", datewidth)
        .attr("height", dateheight);

    // Add svg groups for the focus and context portions of the graphic
    var datefocus = dateSVG.append("g")
        .attr("class", "focus")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var datecontext = dateSVG.append("g")
        .attr("class", "context")
        .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

    // Invoked on initialization and interaction
    function brushed() {
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
        var s = d3.event.selection || datex2.range();

        datex.domain(s.map(datex2.invert, datex2));
        datefocus.select(".area").attr("d", datearea);
        datefocus.select(".areaUser").attr("d", datearea);
        datefocus.select(".axis--x").call(datexAxis);
        dateSVG.select(".zoom").call(datezoom.transform, d3.zoomIdentity
            .scale(datewidth / (s[1] - s[0]))
            .translate(-s[0], 0));
        plotSelection = s.map(datex2.invert);
    }

    function zoomed() {
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
        var t = d3.event.transform;
        datex.domain(t.rescaleX(datex2).domain());
        datefocus.select(".area").attr("d", datearea);
        datefocus.select(".areaUser").attr("d", datearea);
        datefocus.select(".axis--x").call(datexAxis);
        datecontext.select(".brush").call(datebrush.move, datex.range().map(t.invertX, t));
    }

    // d3.csv([data], [accessor], [callback])   // Data accessing/load is processed asynchronously
    d3.csv(datepath, function (d) {
        var parseDate = d3.timeParse("%b %Y");
        d.Date = parseDate(d.Date);
        d.Freq = +d.Freq;
        return d;
    }, function (error, data) {
        if (error) throw error;

        // Set calendar ranges
        datemin = d3.min(data, function (d) {
            return d.Date;
        });

        datemax = d3.max(data, function (d) {
            return d.Date;
        });

        var freqmax = d3.max(data, function (d) {
            return d.Freq;
        });

        // Filter highlighted data by date picked
        var data_highlight = data.filter(function (row) {
            return row.Date >= dateminUser && row.Date <= datemaxUser;
        });

        var format = d3.timeFormat("%m-%d-%Y");

        if (dateSetup) {
            $("#fromdate").datepicker('option', 'minDate', datemin);
            $("#fromdate").datepicker('option', 'maxDate', datemax);
            $("#fromdate").datepicker('option', 'defaultDate', datemin);
            $("#fromdate").datepicker('option', 'yearRange', datemin.getFullYear() + ':' + datemax.getFullYear());

            $("#todate").datepicker('option', 'minDate', datemin);
            $("#todate").datepicker('option', 'maxDate', datemax);
            $("#todate").datepicker('option', 'defaultDate', datemax);
            $("#todate").datepicker('option', 'yearRange', dateminUser.getFullYear() + ':' + datemax.getFullYear());

            $('#fromdate').val(format(datemin));
            $('#todate').val(format(datemax));
        }

        // Domain of dates: (range was set in variable initialization)
        datex.domain(d3.extent(data, function (d) {
            return d.Date;
        }));

        datey.domain([0, freqmax]);
        datex2.domain(datex.domain());
        datey2.domain(datey.domain());

        // Draw data on focus portion of svg (datefocus) with the area variable attribute
        datefocus.append("path")
            .datum(data)
            .style("fill", "#ADADAD")
            .attr("class", "area")
            .attr("d", datearea);

        // Draw a highlighted path to focus portion of svg within datearea parameters
        datefocus.append("path")
            .datum(data_highlight)
            .attr("class", "areaUser")
            .style("clip-path", "url(#clip)")
            .style("fill", "steelblue")
            .attr("d", datearea);

        // Add x and y axes to focus group
        datefocus.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + dateheight + ")")
            .call(datexAxis);

        datefocus.append("g")
            .attr("class", "axis axis--y")
            .call(dateyAxis);

        // Draw data on context portion of svg (datecontext)
        datecontext.append("path")
            .datum(data)
            .style("fill", "#ADADAD")
            .attr("class", "area")
            .attr("d", datearea2);

        // Draw a highlighted path to context portion of svg
        datecontext.append("path")
            .datum(data_highlight)
            .style("fill", "steelblue")
            .attr("class", "area")
            .attr("d", datearea2);

        // Add x axis to context group
        datecontext.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + dateheight2 + ")")
            .call(datexAxis2);

        // Add brushes to context group
        datecontext.append("g")
            .attr("class", "brush")
            .call(datebrush)
            .call(datebrush.move, datex.range());

        // Draw a box? Maybe for buffering?
        dateSVG.append("rect")
            .attr("class", "zoom")
            .attr("width", datewidth)
            .attr("height", dateheight)
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .call(datezoom);

        dateSVG.append("datecontext");

        dateSetup = false;
    })
}

// Initial date plot setup, and set the default date range
createDateplot();


min=datemin.getFullYear();
max=datemax.getFullYear();

$("#fromdate").datepicker({
    dateFormat: 'mm-dd-yy',
    changeYear: true,
    changeMonth: true,
    defaultDate: datemin,
    yearRange: min + ':' + max,
    minDate: datemin,
    maxDate: datemax,
    orientation: top,
    onSelect: function () {
        dateminUser = $(this).datepicker('getDate');
        $("#todate").datepicker('option', 'minDate', dateminUser);
        $("#todate").datepicker('option', 'defaultDate', datemax);
        $("#todate").datepicker('option', 'maxDate', datemax);
        fromdatestring = dateminUser.getFullYear() + "" + ('0' + (dateminUser.getMonth() + 1)).slice(-2) + "" + ('0' + dateminUser.getDate()).slice(-2);
        qr["query"]["date8"]["$gte"] = fromdatestring;

        // console.log("fromdate clicked,query:", qr);
    },
    onClose: function (selectedDate) {
        setTimeout(function () {
            $('#todate').focus();
        }, 100);

        createDateplot();
        $("#todate").datepicker("show");
    }
});


$("#todate").datepicker({
    changeYear: true,
    changeMonth: true,
    yearRange: min + ':' + max,
    dateFormat: 'mm-dd-yy',
    defaultDate: datemax,
    minDate: dateminUser,
    maxDate: datemax,
    orientation: top,
    onSelect: function () {
        datemaxUser = $(this).datepicker('getDate');
        todatestring = datemaxUser.getFullYear() + "" + ('0' + (datemaxUser.getMonth() + 1)).slice(-2) + "" + ('0' + datemaxUser.getDate()).slice(-2);
        qr["query"]["date8"]["$lte"] = todatestring;
        // console.log("todate selected,query string:", qr);
    },
    onClose: function () {
        createDateplot();
    }
});


function setDatefromSlider() {
    // Update user preference
    [dateminUser, datemaxUser] = plotSelection;

    // Update gui
    var format = d3.time.format("%m-%d-%Y");
    $('#fromdate').val(format(dateminUser));
    $('#todate').val(format(datemaxUser));

    // Update sql command
    fromdatestring = dateminUser.getFullYear() + "" + ('0' + (dateminUser.getMonth() + 1)).slice(-2) + "" + ('0' + dateminUser.getDate()).slice(-2);
    qr["query"]["date8"]["$gte"] = fromdatestring;
    todatestring = datemaxUser.getFullYear() + "" + ('0' + (datemaxUser.getMonth() + 1)).slice(-2) + "" + ('0' + datemaxUser.getDate()).slice(-2);
    qr["query"]["date8"]["$lte"] = todatestring;

    // Update plot
    createDateplot()
}