import React from "react";
import { FormGroup, Label } from "reactstrap";
import { Field, ErrorMessage } from "formik";
import * as locationService from "../../services/locationService";

class LocationBasicForm extends React.Component {
  state = {
    statesOptions: [],
    locationOptions: [],
  };

  componentDidMount() {
    locationService
      .getTypes()
      .then(this.onGetTypesSuccess)
      .catch(this.onGetTypesError);
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

  render() {
    return (
      <React.Fragment>
        <FormGroup>
          <Label>Location Type</Label>
          <ErrorMessage
            name="locationTypeId"
            component="span"
            className="locationsFormError"
          />
          <Field
            name="location.locationTypeId"
            component="select"
            label="LocationTypeId"
            className="form-control"
            as="select"
          >
            <option value="">Select Location Type</option>
            {this.state.locationOptions}
          </Field>
        </FormGroup>
        <FormGroup>
          <Label htmlFor="lineOne">Address Line One</Label>
          <ErrorMessage
            name="location.lineOne"
            component="span"
            className="locationsFormError"
          />
          <Field
            name="location.lineOne"
            placeholder="123 Main St."
            component="input"
            className="form-control"
          />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="lineTwo">Address Line Two</Label>
          <Field
            name="location.lineTwo"
            placeholder="Apt. #"
            component="input"
            className="form-control"
          />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="city">City</Label>
          <ErrorMessage
            name="location.city"
            component="span"
            className="locationsFormError"
          />
          <Field
            name="location.city"
            placeholder="City"
            component="input"
            className="form-control"
          />
        </FormGroup>
        <FormGroup>
          <Label>State</Label>
          <ErrorMessage
            name="location.state"
            component="span"
            className="locationsFormError"
          />
          <Field
            name="location.state"
            component="select"
            label="state"
            className="form-control"
            as="select"
          >
            <option value="">Select State</option>
            {this.state.statesOptions}
          </Field>
        </FormGroup>
        <FormGroup>
          <Label htmlFor="zip">Zip-Code</Label>
          <ErrorMessage
            name="location.zip"
            component="span"
            className="locationsFormError"
          />
          <Field
            name="location.zip"
            placeholder="Zip"
            component="input"
            className="form-control"
          />
        </FormGroup>
      </React.Fragment>
    );
  }
}

LocationBasicForm.propTypes = {};

export default LocationBasicForm;
