import React from "react";
import { withTheme, withStyles } from "@material-ui/core/styles";
import {
  ControlledField,
  PublishedComponent,
  FormPanel,
  TextInput,
  TextAreaInput,
  withModulesManager,
  ValidatedTextInput,
} from "@openimis/fe-core";
import { Grid } from "@material-ui/core";
import { connect } from "react-redux";
import { HFCodeValidationCheck, HFCodeValidationClear, HFCodeSetValid } from "../actions";
import _ from "lodash";

const styles = (theme) => ({
  item: theme.paper.item,
});

class HealthFacilityMasterPanel extends FormPanel {
  constructor(props) {
    super(props);
    this.codeMaxLength = props.modulesManager.getConf("fe-location", "healthFacilityForm.codeMaxLength", 8);
    this.accCodeMaxLength = props.modulesManager.getConf("fe-location", "healthFacilityForm.accCodeMaxLength", 25);
    this.accCodeMandatory = props.modulesManager.getConf("fe-location", "healthFacilityForm.accCodeMandatory", false);
  }

  updateAttributes = (updates) => {
    let data = _.merge({}, this.state.data, updates);
    this.props.onEditedChanged(data);
  };

  updateRegion = (region) => {
    let jsonExt = {
      ward: null,
    }
    this.updateAttributes({
      parentLocation: region,
      location: null,
      jsonExt: jsonExt,
      servicesPricelist: null,
      itemsPricelist: null,
    });
  };

  updateDistrict = (district) => {
    let jsonExt = {
      ward: null,
    }
    this.updateAttributes({
      parentLocation: !!district ? district.parent : null,
      location: district,
      jsonExt: jsonExt,
      servicesPricelist: null,
      itemsPricelist: null,
    });
  };

  shouldValidate = (inputValue) => {
    const { savedHFCode } = this.props;
    const shouldValidate = inputValue !== savedHFCode;
    return shouldValidate;
  };

  render() {
    const {
      classes,
      edited,
      reset,
      readOnly = false,
      isHFCodeValid,
      isHFCodeValidating,
      HFCodeValidationError,
    } = this.props;
    return (
      <Grid container>
        <ControlledField
          module="location"
          id="HealthFacility.region"
          field={
            <Grid item xs={2} className={classes.item}>
              <PublishedComponent
                pubRef="location.LocationPicker"
                value={edited.parentLocation}
                readOnly={readOnly}
                withNull={true}
                required={true}
                onChange={(v) => this.updateRegion(v)}
                locationLevel={0}
              />
            </Grid>
          }
        />
        <ControlledField
          module="location"
          id="HealthFacility.district"
          field={
            <Grid item xs={2} className={classes.item}>
              <PublishedComponent
                pubRef="location.LocationPicker"
                value={edited.location}
                readOnly={readOnly}
                withNull={true}
                required={true}
                onChange={(v) => this.updateDistrict(v)}
                parentLocation={edited.parentLocation}
                locationLevel={1}
              />
            </Grid>
          }
        />
        <ControlledField
          module="location"
          id="HealthFacility.ward"
          field={
            <Grid item xs={2} className={classes.item}>
              <PublishedComponent
                pubRef="location.LocationPicker"
                value={edited?.jsonExt?.ward ?? ""}
                readOnly={readOnly}
                withNull={true}
                required={true}
                onChange={(v) => this.updateExt("ward", v)} // storing the whole object in json for easy fetching and recreating in FE (even if it's creating a lot of redundant data in the DB)
                parentLocation={edited.location}
                locationLevel={2}
              />
            </Grid>
          }
        />
        <ControlledField
          module="location"
          id="HealthFacility.legalForm"
          field={
            <Grid item xs={2} className={classes.item}>
              <PublishedComponent
                pubRef="location.HealthFacilityLegalFormPicker"
                value={!!edited.legalForm ? edited.legalForm.code : null}
                nullLabel="empty"
                reset={reset}
                readOnly={readOnly}
                required={true}
                onChange={(v, s) => this.updateAttribute("legalForm", !!v ? { code: v } : null)}
              />
            </Grid>
          }
        />
        <ControlledField
          module="location"
          id="HealthFacility.level"
          field={
            <Grid item xs={2} className={classes.item}>
              <PublishedComponent
                pubRef="location.HealthFacilityLevelPicker"
                value={edited.level}
                nullLabel="empty"
                reset={reset}
                readOnly={readOnly}
                required={true}
                onChange={(v, s) => this.updateAttribute("level", v)}
              />
            </Grid>
          }
        />
        <ControlledField
          module="location"
          id="HealthFacility.subLevel"
          field={
            <Grid item xs={2} className={classes.item}>
              <PublishedComponent
                pubRef="location.HealthFacilitySubLevelPicker"
                value={!!edited.subLevel ? edited.subLevel.code : null}
                nullLabel="empty"
                reset={reset}
                readOnly={readOnly}
                onChange={(v, s) => this.updateAttribute("subLevel", !!v ? { code: v } : null)}
              />
            </Grid>
          }
        />
        <ControlledField
          module="location"
          id="HealthFacility.careType"
          field={
            <Grid item xs={2} className={classes.item}>
              <PublishedComponent
                pubRef="medical.CareTypePicker"
                value={edited.careType}
                nullLabel="empty"
                reset={reset}
                readOnly={readOnly}
                required={true}
                onChange={(v, s) => this.updateAttribute("careType", v)}
              />
            </Grid>
          }
        />
        <ControlledField
          module="location"
          id="HealthFacility.code"
          field={
            <Grid item xs={2} className={classes.item}>
              <ValidatedTextInput
                itemQueryIdentifier="healthFacilityCode"
                shouldValidate={this.shouldValidate}
                isValid={isHFCodeValid}
                isValidating={isHFCodeValidating}
                validationError={HFCodeValidationError}
                action={HFCodeValidationCheck}
                clearAction={HFCodeValidationClear}
                setValidAction={HFCodeSetValid}
                module="location"
                label="location.HealthFacilityForm.code"
                codeTakenLabel="location.HealthFacilityForm.codeTaken"
                name="code"
                value={edited.code}
                readOnly={readOnly}
                required={true}
                onChange={(code, s) => this.updateAttribute("code", code)}
                inputProps={{
                  "maxLength": this.codeMaxLength,
                }}
              />
            </Grid>
          }
        />
        <ControlledField
          module="location"
          id="HealthFacility.accCode"
          field={
            <Grid item xs={2} className={classes.item}>
              <TextInput
                module="location"
                label="HealthFacilityForm.accCode"
                name="accCode"
                value={edited.accCode}
                readOnly={readOnly}
                required={this.accCodeMandatory}
                onChange={(v, s) => this.updateAttribute("accCode", v)}
                inputProps={{
                  "maxLength": this.accCodeMaxLength,
                }}
              />
            </Grid>
          }
        />
        <ControlledField
          module="location"
          id="HealthFacility.name"
          field={
            <Grid item xs={2} className={classes.item}>
              <TextInput
                module="location"
                label="HealthFacilityForm.name"
                name="name"
                value={edited.name}
                readOnly={readOnly}
                required={true}
                onChange={(v, s) => this.updateAttribute("name", v)}
              />
            </Grid>
          }
        />
        <Grid item xs={2} className={classes.item}>
          <TextAreaInput
            module="location"
            label="HealthFacilityForm.address"
            value={edited.address}
            rows="2"
            readOnly={readOnly}
            onChange={(v, s) => this.updateAttribute("address", v)}
          />
        </Grid>
        <ControlledField
          module="location"
          id="HealthFacility.phone"
          field={
            <Grid item xs={1} className={classes.item}>
              <TextInput
                module="location"
                label="HealthFacilityForm.phone"
                name="phone"
                value={edited.phone}
                readOnly={readOnly}
                onChange={(v, s) => this.updateAttribute("phone", v)}
              />
            </Grid>
          }
        />
        <ControlledField
          module="location"
          id="HealthFacility.fax"
          field={
            <Grid item xs={1} className={classes.item}>
              <TextInput
                module="location"
                label="HealthFacilityForm.fax"
                name="fax"
                value={edited.fax}
                readOnly={readOnly}
                onChange={(v, s) => this.updateAttribute("fax", v)}
              />
            </Grid>
          }
        />
        <ControlledField
          module="location"
          id="HealthFacility.email"
          field={
            <Grid item xs={2} className={classes.item}>
              <TextInput
                module="location"
                label="HealthFacilityForm.email"
                name="email"
                value={edited.email}
                readOnly={readOnly}
                onChange={(v, s) => this.updateAttribute("email", v)}
              />
            </Grid>
          }
        />
      </Grid>
    );
  }
}

const mapStateToProps = (state) => ({
  isHFCodeValid: state.loc.validationFields?.HFCode?.isValid,
  isHFCodeValidating: state.loc.validationFields?.HFCode?.isValidating,
  HFCodeValidationError: state.loc.validationFields?.HFCode?.validationError,
  savedHFCode: state.loc?.healthFacility?.code,
});

export default withModulesManager(connect(mapStateToProps)(withTheme(withStyles(styles)(HealthFacilityMasterPanel))));
