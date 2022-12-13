import React from "react";
import ToolTip from '@material-ui/core/Tooltip';

class AttentionWarning extends React.Component {
    render(){
        if(parseInt(this.props.version.substring(0, 1)) < 5) {
            return <ToolTip title={"Node requires upgrade to latest version."}>
                <span className="fe fe-alert-triangle ml-2"></span>
            </ToolTip>
        } else if((this.props.highestBlock - this.props.currentBlock) > 1000) {
            return <ToolTip title={"Node requires attention. If the node is still syncing ignore this message."}>
                <span className="fe fe-alert-triangle ml-2"></span>
            </ToolTip>
        } else {
            return ''
        }
    }
}

export default AttentionWarning;
