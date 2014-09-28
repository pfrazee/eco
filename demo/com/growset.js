/** @jsx React.DOM */
module.exports = React.createClass({
    getInitialState: function() {
        return this.props.obj
    },
    handleAdd: function(e) {
        var v = this.refs.entry.getDOMNode().value
        if (!v) return
        
        this.props.obj[this.props.key].push(v)
        this.props.onChange('green', this.props.key+': add '+v)

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