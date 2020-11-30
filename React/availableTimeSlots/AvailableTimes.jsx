import React from "react";
import { Modal } from "react-bootstrap";
import { format, addMinutes } from "date-fns";
import Swal from "sweetalert2";
import PropTypes from "prop-types";
import * as availableTimeSlotsService from "../../services/availableTimeSlotsService";

class AvailableTimes extends React.Component {
  state = {
    isOpen: false,
    availableSlots: [],
    availableTimes: [],
    selectedStartTime: "",
    selectedEndTime: "",
    currentPage: 0,
    pageSize: 5,
    sessionDuration: 0,
  };

  static getDerivedStateFromProps(props, state) {
    if (props.sessionDuration !== state.sessionDuration) {
      return {
        sessionDuration: props.sessionDuration,
      };
    }
    return null;
  }

  componentDidMount() {
    this.getTimeSlots();
  }

  getTimeSlots = () => {
    availableTimeSlotsService
      .getAll(
        this.state.currentPage,
        this.state.pageSize,
        this.state.sessionDuration
      )
      .then(this.onGetAllSuccess)
      .catch(this.onGetAllError);
  };

  onGetAllSuccess = (response) => {
    this.setState((prevState) => ({
      ...prevState,
      availableSlots: response.item.pagedItems.map((item) => (
        <option
          key={item.blockStart}
          value={`${item.blockStart} ${item.blockEnd}`}
          name={item.blockStart}
        >{`${format(new Date(item.blockStart), "MM/d/yyyy")}, ${format(
          new Date(item.blockStart),
          "h:mm a"
        )} - ${format(new Date(item.blockEnd), "h:mm a")}`}</option>
      )),
    }));
  };

  handleClick = () => {
    this.setState((prevState) => ({
      ...prevState,
      isOpen: !prevState.isOpen,
    }));
  };

  handleNextClick = () => {
    this.setState(
      (prevState) => ({
        ...prevState,
        currentPage: prevState.currentPage + 1,
      }),
      this.getTimeSlots
    );
  };

  handlePreviousClick = () => {
    if (this.state.currentPage > 0) {
      this.setState(
        (prevState) => ({
          ...prevState,
          currentPage: prevState.currentPage - 1,
        }),
        this.getTimeSlots
      );
    }
  };

  handleSlotChange = (e) => {
    const date = e.target.value.split(" ");
    const start = new Date(date[0]);
    const end = new Date(date[1]);
    const maxInterval =
      (end.getHours() - start.getHours() - this.state.sessionDuration / 60) *
        2 +
      1;
    let newStartTimes = [];

    for (let i = 0; i < maxInterval; i++) {
      let newTime = addMinutes(new Date(start), 30 * i).toLocaleString();
      newStartTimes.push(
        <option key={newTime} value={newTime} name={newTime}>
          {newTime}
        </option>
      );
    }
    this.setState((prevState) => ({
      ...prevState,
      availableTimes: newStartTimes,
    }));
  };

  handleSelectChange = (e) => {
    const selectedStartTime = e.target.value;
    const selectedEndTime = addMinutes(
      new Date(selectedStartTime),
      this.state.sessionDuration
    ).toLocaleString();

    this.setState((prevState) => ({
      ...prevState,
      selectedStartTime,
      selectedEndTime,
    }));
  };

  handleSubmit = () => {
    this.handleClick();

    let html = `<div> Start: ${this.state.selectedStartTime}</div><div>End: ${this.state.selectedEndTime}</div>`;

    Swal.fire({
      title: "Please confirm your appointment time:",
      html: html,
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Yes, it's correct!",
      cancelButtonText: "No, change it",
    }).then(this.onConfirm);
  };

  onConfirm = (result) => {
    if (result.value) {
      this.props.SelectedTime(
        this.state.selectedStartTime,
        this.state.selectedEndTime
      );
      return null;
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      Swal.fire("Cancelled", "Please select a new time", "error");
      this.handleClick();
    }
  };

  render() {
    return (
      <React.Fragment>
        <button className="btn btn-primary m-5" onClick={this.handleClick}>
          View Available Times
        </button>
        <Modal
          show={this.state.isOpen}
          centered={true}
          onHide={this.handleClick}
        >
          <Modal.Body>
            <form>
              <div className="form-group">
                <label>Choose an available date</label>
                <select
                  className="form-control"
                  onChange={this.handleSlotChange}
                >
                  <option value="">Click Next for more options</option>
                  {this.state.availableSlots}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="availableTimes">Choose an available time</label>
                <select
                  className="form-control"
                  onChange={this.handleSelectChange}
                >
                  <option value="">
                    Select an available date above before choosing a time
                  </option>
                  {this.state.availableTimes}
                </select>
              </div>
            </form>
          </Modal.Body>
          <Modal.Footer className="d-flex justify-content-between">
            <div>
              <button
                className="btn btn-secondary mr-2"
                onClick={this.handlePreviousClick}
              >
                {"<"} Previous
              </button>
              <button
                className="btn btn-secondary"
                onClick={this.handleNextClick}
              >
                Next {">"}
              </button>
            </div>
            <div>
              <button className="btn btn-primary" onClick={this.handleSubmit}>
                Submit
              </button>
            </div>
          </Modal.Footer>
        </Modal>
      </React.Fragment>
    );
  }
}

AvailableTimes.propTypes = {
  sessionDuration: PropTypes.number,
  SelectedTime: PropTypes.func,
};

export default AvailableTimes;
