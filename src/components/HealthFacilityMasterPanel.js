import React from "react";
import { withTheme, withStyles } from "@material-ui/core/styles";
import {
  ControlledField,
  PublishedComponent,
  FormPanel,
  TextInput,
  NumberInput,
  TextAreaInput,
  withModulesManager,
  ValidatedTextInput,
  formatMessage,
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
    this.codeMaxLength = props.modulesManager.getConf("fe-location", "healthFacilityForm.codeMaxLength", 20);
    this.shortFormMaxLength = props.modulesManager.getConf("fe-location", "healthFacilityForm.shortFormMaxLength", 5);
    this.accCodeMaxLength = props.modulesManager.getConf("fe-location", "healthFacilityForm.accCodeMaxLength", 25);
    this.accCodeMandatory = props.modulesManager.getConf("fe-location", "healthFacilityForm.accCodeMandatory", false);
  }

  updateAttributesMerged = (updates) => {
    let data = _.merge({}, this.state.data, updates);
    this.props.onEditedChanged(data);
  };

  updateRegion = (region) => {
    let jsonExt = {
      ward: null,
    }
    this.updateAttributesMerged({
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
    this.updateAttributesMerged({
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
        <Grid item xs={2} className={classes.item}>
          <PublishedComponent
            label={formatMessage(this.props.intl, "location", "HealthFacilityForm.region")}
            pubRef="location.LocationPicker"
            value={edited.parentLocation}
            readOnly={readOnly}
            withNull={true}
            required={true}
            onChange={(v) => this.updateRegion(v)}
            locationLevel={0}
          />
        </Grid>
        <ControlledField
          module="location"
          id="HealthFacility.district"
          field={
            <Grid item xs={2} className={classes.item}>
              <PublishedComponent
                pubRef="location.LocationPicker"
                label={formatMessage(this.props.intl, "location", "HealthFacilityForm.district")}
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
                label={formatMessage(this.props.intl, "location", "HealthFacilityForm.ward")}
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
          id="HealthFacility.name"
          field={
            <Grid item xs={6} className={classes.item}>
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
          id="HealthFacility.shortForm"
          field={
            <Grid item xs={2} className={classes.item}>
              <TextInput
                module="location"
                label="HealthFacilityForm.shortForm"
                name="shortForm"
                value={edited?.jsonExt?.short_form ?? ""}
                readOnly={readOnly}
                required
                onChange={(v, s) => this.updateExt("short_form", v)}
                inputProps={{
                  "maxLength": this.shortFormMaxLength,
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
        <Grid item xs={2} className={classes.item}>
          <NumberInput
            module="location"
            label="HealthFacilityForm.beds"
            value={edited?.jsonExt?.beds ?? ""}
            readOnly={readOnly}
            required
            onChange={(v) => this.updateExt("beds", v)}
          />
        </Grid>
        <Grid item xs={2} className={classes.item}>
          <TextInput
            module="location"
            label="HealthFacilityForm.licenseStatus"
            name="licenseStatus"
            value={edited?.jsonExt?.licenseStatus ?? ""}
            readOnly={readOnly}
            required
            onChange={(v) => this.updateExt("licenseStatus", v)}
          />
        </Grid>
        <Grid item xs={2} className={classes.item}>
          <TextInput
            module="location"
            label="HealthFacilityForm.grantID"
            name="grantID"
            value={edited?.jsonExt?.grantID ?? ""}
            readOnly={readOnly}
            required
            onChange={(v) => this.updateExt("grantID", v)}
          />
        </Grid>
        <Grid item xs={2} className={classes.item}>
          <TextInput
            module="location"
            label="HealthFacilityForm.focalPerson"
            name="focalPerson"
            value={edited?.jsonExt?.focalPerson ?? ""}
            readOnly={readOnly}
            required
            onChange={(v) => this.updateExt("focalPerson", v)}
          />
        </Grid>
        <Grid item xs={2} className={classes.item}>
          <PublishedComponent
            pubRef="core.DatePicker"
            value={edited.spimmContractStartDate}
            module="location"
            label="HealthFacilityForm.spimmContractStartDate"
            readOnly={readOnly}
            required
            onChange={(v) => this.updateAttribute("spimmContractStartDate", v)}
          />
        </Grid>
        <Grid item xs={2} className={classes.item}>
          <PublishedComponent
            pubRef="core.DatePicker"
            value={edited.spimmContractEndDate}
            module="location"
            label="HealthFacilityForm.spimmContractEndDate"
            readOnly={readOnly}
            required
            onChange={(v) => this.updateAttribute("spimmContractEndDate", v)}
          />
        </Grid>
        <ControlledField
          module="location"
          id="HealthFacility.phone"
          field={
            <Grid item xs={2} className={classes.item}>
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
            <Grid item xs={2} className={classes.item}>
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
        <Grid item xs={8} className={classes.item}>
          <TextAreaInput
            module="location"
            label="HealthFacilityForm.address"
            value={edited.address}
            readOnly={readOnly}
            onChange={(v, s) => this.updateAttribute("address", v)}
          />
        </Grid>
        <ControlledField
          module="location"
          id="HealthFacility.email"
          field={
            <Grid item xs={12} className={classes.item}>
              <TextAreaInput
                module="location"
                label="HealthFacilityForm.email"
                name="email"
                rows={3}
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
