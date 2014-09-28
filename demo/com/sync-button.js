/** @jsx React.DOM */
module.exports = React.createClass({
    handleSync: function(e) {
        console.log('SYNC')
    },
    render: function() {
        if (this.props.canSync)
            return <span><button onClick={this.handleSync}>sync</button></span>;
        return <span><button disabled onClick={this.handleSync}>sync</button></span>;
    }
})