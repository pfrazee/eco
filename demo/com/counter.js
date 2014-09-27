/** @jsx React.DOM */
module.exports = React.createClass({
    getInitialState: function() {
        return this.props.obj
    },
    handleInc: function(e) {
        this.props.obj[this.props.key]++
        this.setState(this.props.obj)
    },
    handleDec: function(e) {
        this.props.obj[this.props.key]--
        this.setState(this.props.obj)
    },
    render: function() {
        return <div className="counter field">
            Counter<br/>
            <input type="text" value={this.state[this.props.key]} readOnly />
            <button onClick={this.handleInc}>+</button><button onClick={this.handleDec}>-</button>
        </div>;
    }
})