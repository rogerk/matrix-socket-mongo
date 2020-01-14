import $ from "jquery";
import io from "socket.io-client";

const socketUri = "http://localhost:4001";
const socket = io.connect(socketUri);
socket.on("ALL_MATRIX_RESPONSE", data => {
    if (data[0].rows) {
        $("#rows").val(data[0].rows);
    }
    if (data[0].cols) {
        $("#cols").val(data[0].cols);
    }
    $("#output").text(JSON.stringify(data, undefined, 2));
});
socket.on("PIXELS_RESPONSE", data => {
    $("#output").text(JSON.stringify(data, undefined, 2));
});
socket.on("RESET_RESPONSE", data => {
    $("#output").text(JSON.stringify(data, undefined, 2));
});
socket.on("UPDATE_PIXELS_RESPONSE", data => {
    $("#output").text(JSON.stringify(data, undefined, 2));
});
$("#allmatrix").click(() => {
    socket.emit("ALL_MATRIX");
    return false;
});

// Document load - just reset to defaults
$(document).ready(() => {
    const rows = $("#rows").val();
    const cols = $("#cols").val();
    const color = $("#color").val();
    adjustRowsColumns(rows, cols);
    socket.emit("RESET", rows, cols, color);
});

$("#pixels").click(() => {
    let xvals = $("#x").val();
    let yvals = $("#y").val();
    if (xvals.length == 0) {
        let options = $("#x option");
        xvals = $.map(options, function(option) {
            return option.value;
        });
    }
    if (yvals.length == 0) {
        let options = $("#y option");
        yvals = $.map(options, function(option) {
            return option.value;
        });
    }
    const coords = [];

    for (let x = 0; x < xvals.length; x++) {
        for (let y = 0; y < yvals.length; y++) {
            const xy = [];
            xy[0] = xvals[x];
            xy[1] = yvals[y];
            coords.push(xy);
        }
    }
    socket.emit("PIXELS", coords);
    return false;
});
$("#reset").click(() => {
    const rows = $("#rows").val();
    const cols = $("#cols").val();
    const color = $("#color").val();
    adjustRowsColumns(rows, cols);
    socket.emit("RESET", rows, cols, color);
    return false;
});
$("#updatepixels").click(() => {
    let xvals = $("#updatex").val();
    let yvals = $("#updatey").val();
    if (xvals.length == 0) {
        let options = $("#x option");
        xvals = $.map(options, function(option) {
            return option.value;
        });
    }
    if (yvals.length == 0) {
        let options = $("#y option");
        yvals = $.map(options, function(option) {
            return option.value;
        });
    }
    const coords = [];
    const color = $("#updatecolor").val();
    for (let x = 0; x < xvals.length; x++) {
        for (let y = 0; y < yvals.length; y++) {
            const xy = [];
            xy[0] = xvals[x];
            xy[1] = yvals[y];
            coords.push(xy);
        }
    }
    socket.emit("UPDATE_PIXELS", coords, color);
    return false;
});

const adjustRowsColumns = (rows, cols) => {
    $("#x").empty();
    $("#y").empty();
    $("#updatex").empty();
    $("#updatey").empty();

    for (let i = 0; i < rows; i++) {
        $("#x").append(
            $("<option></option>")
                .attr("value", i)
                .text(i)
        );
        $("#updatex").append(
            $("<option></option>")
                .attr("value", i)
                .text(i)
        );
    }
    for (let i = 0; i < cols; i++) {
        $("#y").append(
            $("<option></option>")
                .attr("value", i)
                .text(i)
        );
        $("#updatey").append(
            $("<option></option>")
                .attr("value", i)
                .text(i)
        );
    }
};
