import React from "react";
import ToolTip from '@material-ui/core/Tooltip';

class AttentionWarning extends React.Component {
    constructor(props){
        super(props);
    }

    render(){
        if((this.props.highestBlock - this.props.currentBlock) > 1000) {
            return <ToolTip title={"Node requires attention. If the node is still syncing ignore this message."}>
                <span className="fe fe-alert-triangle ml-2"></span>
            </ToolTip>
        } else {
            return ''
        }
    }
}

export default AttentionWarning;
