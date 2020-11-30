import React from "react";
import { Form, FormGroup, Label } from "reactstrap";
import { Formik, Field, ErrorMessage } from "formik";
import locationValidationSchema from "./locationValidationSchema";
import PropTypes from "prop-types";

const LocationForm = (props) => {
  return (
    <React.Fragment>
      <Formik
        enableReinitialize={true}
        validationSchema={locationValidationSchema}
        initialValues={props.formData}
      >
        {({ values, isValid, dirty }) => (
          <Form>
            <h3>New Location</h3>
            <br />
            <FormGroup>
              <Label>Location Type</Label>
              <ErrorMessage
                name="locationTypeId"
                component="span"
                className="locationsFormError"
              />
              <Field
                name="locationTypeId"
                component="select"
                label="LocationTypeId"
                className="form-control"
                as="select"
              >
                <option value="">Select Location Type</option>
                {props.locationOptions}
              </Field>
            </FormGroup>
            <FormGroup>
              <Label htmlFor="lineOne">Address Line One</Label>
              <ErrorMessage
                name="lineOne"
                component="span"
                className="locationsFormError"
              />
              <Field
                name="lineOne"
                placeholder="123 Main St."
                component="input"
                className="form-control"
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="lineTwo">Address Line Two</Label>
              <Field
                name="lineTwo"
                placeholder="Apt. #"
                component="input"
                className="form-control"
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="city">City</Label>
              <ErrorMessage
                name="city"
                component="span"
                className="locationsFormError"
              />
              <Field
                name="city"
                placeholder="City"
                component="input"
                className="form-control"
              />
            </FormGroup>
            <FormGroup>
              <Label>State</Label>
              <ErrorMessage
                name="state"
                component="span"
                className="locationsFormError"
              />
              <Field
                name="state"
                component="select"
                label="state"
                className="form-control"
                as="select"
              >
                <option value="">Select State</option>
                {props.statesOptions}
              </Field>
            </FormGroup>
            <FormGroup>
              <Label htmlFor="zip">Zip-Code</Label>
              <ErrorMessage
                name="zip"
                component="span"
                className="locationsFormError"
              />
              <Field
                name="zip"
                placeholder="Zip"
                component="input"
                className="form-control"
              />
            </FormGroup>
            <button
              type="submit"
              disabled={!(isValid && dirty)}
              className="btn btn-primary"
              onClick={(e) => {
                e.preventDefault();
                props.formSubmit(values);
              }}
            >
              Submit
            </button>
          </Form>
        )}
      </Formik>
    </React.Fragment>
  );
};

LocationForm.propTypes = {
  formData: PropTypes.shape({
    locationTypeId: PropTypes.number,
    lineOne: PropTypes.string,
    lineTwo: PropTypes.string,
    city: PropTypes.string,
    stateId: PropTypes.number,
    zip: PropTypes.string,
  }),
  formSubmit: PropTypes.func,
  statesOptions: PropTypes.arrayOf(
    PropTypes.shape({
      item: PropTypes.string,
    })
  ),
  locationOptions: PropTypes.arrayOf(
    PropTypes.shape({
      item: PropTypes.string,
    })
  ),
};

export default LocationForm;
