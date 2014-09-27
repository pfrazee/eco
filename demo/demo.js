/** @jsx React.DOM */
var eco = require('../lib')
var Counter = require('./com/counter')
var Register = require('./com/register')
var Growset = require('./com/growset')
var Onceset = require('./com/onceset')

var objects = [
    {counter: 0, reg: 'foo', gset: ['a'], oset: ['apple'] },
    {counter: 1, reg: 'bar', gset: ['b', 'c'], oset: [] }
]
window.objects = objects

var Object = React.createClass({
    render: function() {
        return <div className="object">
            <Counter obj={this.props.obj} key="counter" />
            <Register obj={this.props.obj} key="reg" />
            <Growset obj={this.props.obj} key="gset" />
            <Onceset obj={this.props.obj} key="oset" />
        </div>
    }
})
var objectNodes = objects.map(function(obj, i) {
    return (<Object obj={obj} key={('obj'+i)} />)
})

React.renderComponent(
    <div>
        {objectNodes}
        <button>Add replica</button>
    </div>,
    document.getElementById('app')
)

