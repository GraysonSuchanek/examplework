import React, { useState } from "react";
import PropTypes from "prop-types";
import { Map, InfoWindow, Marker, GoogleApiWrapper } from "google-maps-react";

const MapContainer = (props) => {
  const [isShowingInfo, setIsShowingInfo] = useState(false);

  const addressText = props.currentAddress.split(",");

  return (
    <Map
      google={props.google}
      zoom={props.zoom}
      initialCenter={props.currentLocation}
      center={props.currentLocation}
      className="mapStlye"
    >
      <Marker
        onClick={() => setIsShowingInfo(!isShowingInfo)}
        position={props.currentLocation}
        visible={props.currentAddress !== ""}
      />
      <InfoWindow
        position={props.currentLocation}
        visible={isShowingInfo}
        onClose={() => setIsShowingInfo(!isShowingInfo)}
      >
        <div className="text-center">
          <div>{addressText[0]}</div>
          <div>{addressText[1]}</div>
          <div>{addressText[2]}</div>
          <div>{addressText[3]}</div>
        </div>
      </InfoWindow>
    </Map>
  );
};

MapContainer.propTypes = {
  google: PropTypes.shape({
    item: PropTypes.string,
  }),
  currentLocation: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number,
  }),
  zoom: PropTypes.number,
  currentAddress: PropTypes.string,
  onInfoToggle: PropTypes.func,
  isShowingInfo: PropTypes.bool,
};

const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;

export default GoogleApiWrapper({
  apiKey: GOOGLE_API_KEY,
  language: "en",
})(MapContainer);
