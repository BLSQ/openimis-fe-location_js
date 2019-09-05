import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { fetchUserHealthFacilityFullPath } from "../actions";
import { withModulesManager } from "@openimis/fe-core";

class UserHealthFacility extends Component {
    componentDidMount() {
        if (!!this.props.user.health_facility_id) {
            this.props.fetchUserHealthFacilityFullPath(
                this.props.modulesManager,
                this.props.user.health_facility_id
            );
        }
    }
    render() {
        return null;
    }
}

const mapStateToProps = state => ({
    user: state.core.user.i_user,
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ fetchUserHealthFacilityFullPath }, dispatch);
};


export default withModulesManager(connect(mapStateToProps, mapDispatchToProps)(UserHealthFacility));