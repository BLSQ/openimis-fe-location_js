import React, { Component, Fragment } from "react";
import { injectIntl } from "react-intl";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import ReplayIcon from "@material-ui/icons/Replay";
import {
  ProgressOrError,
  Form,
  withModulesManager,
  journalize,
  formatMessageWithValues,
  Helmet,
} from "@openimis/fe-core";
import HealthFacilityMasterPanel from "../components/HealthFacilityMasterPanel";
import { fetchHealthFacility, clearHealthFacility } from "../actions";

const HF_FORM_CONTRIBUTION_KEY = "location.HealthFacility";

class HealthFacilityForm extends Component {
  state = {
    lockNew: false,
    reset: 0,
    update: 0,
    healthFacility_uuid: null,
    healthFacility: this._newHealthFacility(),
    newHealthFacility: true,
  };

  constructor(props) {
    super(props);
    this.HealthFacilityPriceListsPanel = props.modulesManager.getRef("location.HealthFacilityPriceListsPanel");
    this.accCodeMandatory = props.modulesManager.getConf("fe-location", "healthFacilityForm.accCodeMandatory", false);
  }

  _newHealthFacility() {
    let hf = {};
    hf.jsonExt = {};
    return hf;
  }

  componentDidMount() {
    if (this.props.healthFacility_uuid) {
      this.setState((state, props) => ({ healthFacility_uuid: props.healthFacility_uuid }));
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (
      prevProps.fetchedHealthFacility !== this.props.fetchedHealthFacility &&
      !!this.props.fetchedHealthFacility &&
      !!this.props.healthFacility
    ) {
      const { healthFacility } = this.props;
      healthFacility.parentLocation = healthFacility.location.parent;
      healthFacility.jsonExt = !!healthFacility.jsonExt ? JSON.parse(healthFacility.jsonExt) : {};
      this.setState((state, props) => ({
        healthFacility,
        healthFacility_uuid: props.healthFacility.uuid,
        lockNew: false,
        newHealthFacility: false,
      }));
    } else if (prevState.healthFacility_uuid !== this.state.healthFacility_uuid) {
      this.props.fetchHealthFacility(this.props.modulesManager, this.state.healthFacility_uuid, null);
    } else if (prevProps.healthFacility_uuid && !this.props.healthFacility_uuid) {
      this.setState({ healthFacility: this._newHealthFacility(), lockNew: false, healthFacility_uuid: null });
    } else if (prevProps.submittingMutation && !this.props.submittingMutation) {
      this.props.journalize(this.props.mutation);
      this.setState((state) => ({ reset: state.reset + 1 }));
    }
  }

  componentWillUnmount() {
    this.props.clearHealthFacility();
  }

  _add = () => {
    this.setState(
      (state) => ({
        healthFacility: this._newHealthFacility(),
        lockNew: false,
        newHealthFacility: true,
        reset: state.reset + 1,
      }),
      (e) => {
        this.props.add();
        this.forceUpdate();
      },
    );
  };

  onEditedChanged = (healthFacility) => {
    this.setState({ healthFacility, newHealthFacility: false });
  };

  canSave = () => {
    if (!this.state.healthFacility.code) return false;
    if (this.props.isHFCodeValid === false) return false;
    if (!this.state.healthFacility.name) return false;
    if (!this.state.healthFacility.location) return false;
    if (!this.state.healthFacility.legalForm) return false;
    if (!this.state.healthFacility.level) return false;
    if (!this.state.healthFacility.careType) return false;
    if (!this.state.healthFacility.jsonExt.ward) return false;
    if (!this.state.healthFacility.jsonExt.short_form) return false;
    if (!this.state.healthFacility.jsonExt.beds) return false;
    if (!this.state.healthFacility.jsonExt.licenseStatus) return false;
    if (!this.state.healthFacility.jsonExt.focalPerson) return false;
    if (!this.state.healthFacility.jsonExt.grantID) return false;
    if (!this.state.healthFacility.spimmContractStartDate) return false;
    if (!this.state.healthFacility.spimmContractEndDate) return false;
    if (!!this.accCodeMandatory && !this.state.healthFacility.accCode) return false;
    return true;
  };

  reload = () => {
    this.props.fetchHealthFacility(
      this.props.modulesManager,
      this.state.healthFacility_uuid,
      this.state.healthFacility.code,
    );
  };

  _save = (healthFacility) => {
    this.setState(
      { lockNew: !healthFacility.uuid }, // avoid duplicates
      (e) => this.props.save(healthFacility),
    );
  };

  render() {
    const { fetchingHealthFacility, fetchedHealthFacility, errorHealthFacility, add, save, back } = this.props;
    const { healthFacility_uuid, lockNew, healthFacility, newHealthFacility, reset, update } = this.state;
    let readOnly = lockNew || !!healthFacility.validityTo;
    let actions = [];

    if (healthFacility_uuid) {
      actions.push({
        doIt: this.reload,
        icon: <ReplayIcon />,
        onlyIfDirty: !readOnly,
      });
    }
    return (
      <Fragment>
        <Helmet
          title={formatMessageWithValues(this.props.intl, "location", "healthFacility.edit.page.title", {
            code: this.state.healthFacility.code,
          })}
        />
        <ProgressOrError progress={fetchingHealthFacility} error={errorHealthFacility} />
        {(!!fetchedHealthFacility || !healthFacility_uuid) && (
          <Fragment>
            <Form
              module="location"
              edited_id={healthFacility_uuid}
              edited={healthFacility}
              reset={reset}
              update={update}
              title="healthFacility.edit.title"
              titleParams={{ code: healthFacility.code }}
              back={back}
              add={!!add && !newHealthFacility ? this._add : null}
              save={!!save ? this._save : null}
              canSave={this.canSave}
              reload={(healthFacility_uuid || readOnly) && this.reload}
              readOnly={readOnly}
              HeadPanel={HealthFacilityMasterPanel}
              Panels={[this.HealthFacilityPriceListsPanel]}
              onEditedChanged={this.onEditedChanged}
              actions={actions}
              contributedPanelsKey={HF_FORM_CONTRIBUTION_KEY}
              openDirty={save && !readOnly}
            />
          </Fragment>
        )}
      </Fragment>
    );
  }
}

const mapStateToProps = (state, props) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
  userHealthFacilityFullPath: !!state.loc ? state.loc.userHealthFacilityFullPath : null,
  healthFacility: state.loc.healthFacility,
  fetchingHealthFacility: state.loc.fetchingHealthFacility,
  fetchedHealthFacility: state.loc.fetchedHealthFacility,
  errorHealthFacility: state.loc.errorHealthFacility,
  submittingMutation: state.loc.submittingMutation,
  mutation: state.loc.mutation,
  isHFCodeValid: state.loc.validationFields?.HFCode?.isValid,
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ fetchHealthFacility, clearHealthFacility, journalize }, dispatch);
};

export default withModulesManager(connect(mapStateToProps, mapDispatchToProps)(injectIntl(HealthFacilityForm)));
