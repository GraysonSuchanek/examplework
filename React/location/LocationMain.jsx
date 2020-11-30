import React from "react";
import MapContainer from "./Map";
import LocationForm from "./LocationForm";
import * as locationService from "../../services/locationService";
import "../../../src/assets/scss/locations.css";
import Geocode from "react-geocode";
import { GOOGLE_APIKEY } from "../../services/serviceHelpers"
import Swal from "sweetalert2";
import PropTypes from "prop-types";

class Locations extends React.Component {
  state = {
    locationOptions: [],
    statesOptions: [],
    formData: {
      locationTypeId: 0,
      lineOne: "",
      lineTwo: "",
      city: "",
      state: "",
      zip: "",
      stateId: 0,
    },
    currentLocation: { lat: 33.922188, lng: -118.005614 },
    currentAddress: "",
    zoom: 9,
    isSubmitted: false,
  };

  componentDidMount() {
    Geocode.setApiKey(GOOGLE_APIKEY);
    Geocode.setLanguage("en");
    locationService
      .getTypes()
      .then(this.onGetTypesSuccess)
      .catch((response) => {
        return response;
      });
  }

  onGetTypesSuccess = (response) => {
    this.setState((prevState) => ({
      ...prevState,
      statesOptions: response.item.state.map((state) => (
        <option key={state.id} value={`${state.code}-${state.id}`}>
          {state.name}
        </option>
      )),
      locationOptions: response.item.locationType.map((location) => (
        <option key={location.id} value={Number(location.id)}>
          {location.name}
        </option>
      )),
    }));
  };

  formSubmit = (values) => {
    const address =
      `${values.lineOne},${values.city},${values.state.split("-")[0]} ${
      values.zip
      }` + (values.lineTwo ? `,${values.lineTwo}` : "");
    Geocode.fromAddress(address).then(
      (response) => {
        this.setState((prevState) => ({
          ...prevState,
          currentLocation: response.results[0].geometry.location,
          currentAddress: address,
          zoom: 14,
          isSubmitted: true,
          formData: {
            ...values,
            locationTypeId: Number(values.locationTypeId),
            stateId: Number(values.state.split("-")[1]),
            latitude: response.results[0].geometry.location.lat,
            longitude: response.results[0].geometry.location.lng,
          },
        }));
        this.confirmLocation();
      },
      () => {
        Swal.fire(
          "There was an unexpected error.",
          "Please try again later.",
          "error"
        );
      }
    );
  };

  confirmLocation = () => {
    let html = this.state.currentAddress.split(",");

    html[3]
      ? (html = `<div>
    ${html[0]}</br>
    ${html[1]}</br>
    ${html[2]}</br>
    ${html[3]}</div>`)
      : (html = `<div>
    ${html[0]}</br>
    ${html[1]}</br>
    ${html[2]}</div>`);

    Swal.fire({
      title: "Please confirm the address:",
      html: html,
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Yes, it's correct!",
      cancelButtonText: "No, change it",
    }).then(this.onConfirmLocationSuccess);
  };

  onConfirmLocationSuccess = (result) => {
    if (result.value) {
      const data = { ...this.state.formData };

      locationService
        .addLocation(data)
        .then(this.onAddLocationSuccess)
        .catch(this.onAddLocationError);
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      this.setState((prevState) => ({
        ...prevState,
        isSubmitted: false,
      }));
      Swal.fire(
        "Cancelled",
        "Please submit a new address to continue",
        "error"
      );
    }
  };

  onAddLocationSuccess = (response) => {
    Swal.fire(
      "Location created",
      "Thank you for setting up your location!",
      "success"
    );

    if (this.props.locationId) {
      const id = response.item;

      this.getLocationId(id);
    }
  };

  getLocationId = (id) => {
    this.props.locationId(id);
  };

  onAddLocationError = () => {
    Swal.fire("Location not created", "Please try again", "error");
  };

  render() {
    return (
      <React.Fragment>
        <div className="container d-flex justify-content-center locationMainContainer">
          <div
            className="row justify-content-around
            locationContentContainer"
          >
            <div className="col-md-5 col-sm-12 col-xs-12 locationContent">
            <LocationForm
              formData={this.state.formData}
              formSubmit={this.formSubmit}
              locationOptions={this.state.locationOptions}
              statesOptions={this.state.statesOptions}
            />
          </div>
          <div className="col-md-6 col-sm-12 col-xs-12 locationContent mapStyle">
            <MapContainer
              currentLocation={this.state.currentLocation}
              zoom={this.state.zoom}
              currentAddress={this.state.currentAddress}
            />
          </div>
        </div>
        </div>
      </React.Fragment >
    );
  }
}

export default Locations;

Locations.propTypes = {
  locationId: PropTypes.func,
};
