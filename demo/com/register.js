/** @jsx React.DOM */
module.exports = React.createClass({
    getInitialState: function() {
        return this.props.obj
    },
    handleSet: function(e) {
        this.props.obj[this.props.key] = this.refs.reg.getDOMNode().value
        this.setState(this.props.obj)
    },
    render: function() {
        return <div className="register field">
            Register<br/>
            <input type="text" defaultValue={this.state[this.props.key]} ref="reg" />
            <button onClick={this.handleSet}>set</button>
        </div>;
    }
})