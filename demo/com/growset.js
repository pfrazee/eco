/** @jsx React.DOM */
module.exports = React.createClass({
    getInitialState: function() {
        return this.props.obj
    },
    handleAdd: function(e) {
        this.props.obj[this.props.key].push(this.refs.entry.getDOMNode().value)
        this.refs.entry.getDOMNode().value = ''
        this.setState(this.props.obj)
    },
    render: function() {
        var values = this.props.obj[this.props.key].map(function(v, i) {
            return <li key={('gset'+i)}>{v}</li>
        })
        return <div className="growset set field">
            Growset<br/>
            <ul>{values}</ul>
            <input type="text" ref="entry" />
            <button onClick={this.handleAdd}>add</button>
        </div>;
    }
})