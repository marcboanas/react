/**
 * This file provided by Facebook is for non-commercial testing and evaluation purposes only.
 * Facebook reserves all rights not expressly granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

var Comment = React.createClass({
  render: function() {
    var rawMarkup = marked(this.props.children.toString(), {sanitize: true});
    return (
      <div className="panel panel-default">
        <div className="panel-heading">
          <h3 className="panel-title">
          {this.props.author}
          </h3>
        </div>
        <div className="panel-body" dangerouslySetInnerHTML={{__html: rawMarkup}} />
      </div>
    );
  }
});

var CommentBox = React.createClass({
  loadCommentsFromServer: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handleCommentSubmit: function(comment) {
    var comments = this.state.data;
    comments.push(comment);
    this.setState({data: comments}, function() {
      // `setState` accepts a callback. To avoid (improbable) race condition,
      // `we'll send the ajax request right after we optimistically set the new
      // `state.
      $.ajax({
        url: this.props.url,
        dataType: 'json',
        type: 'POST',
        data: { comment: comment },
        success: function(data) {
          this.setState({data: data});
        }.bind(this),
        error: function(xhr, status, err) {
          console.error(this.props.url, status, err.toString());
        }.bind(this)
      });
    });
  },
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function() {
    this.loadCommentsFromServer();
    setInterval(this.loadCommentsFromServer, this.props.pollInterval);
  },
  render: function() {
    return (
      <div className="commentBox">
        <h1>Comments</h1>
        <CommentList data={this.state.data} />
        <CommentForm onCommentSubmit={this.handleCommentSubmit} />
      </div>
    );
  }
});

var CommentList = React.createClass({
  render: function() {
    console.log(this.props.data)
    var commentNodes = this.props.data.map(function(comment, index) {
      return (
        // `key` is a React-specific concept and is not mandatory for the
        // purpose of this tutorial. if you're curious, see more here:
        // http://facebook.github.io/react/docs/multiple-components.html#dynamic-children
        <Comment author={comment.author} key={index}>
          {comment.text}
        </Comment>
      );
    });
    return (
      <div className="commentList">
        {commentNodes}
      </div>
    );
  }
});

var CommentForm = React.createClass({
  handleSubmit: function(e) {
    e.preventDefault();
    var author = React.findDOMNode(this.refs.author).value.trim();
    var text = React.findDOMNode(this.refs.text).value.trim();
    if (!text || !author) {
      return;
    }
    this.props.onCommentSubmit({author: author, text: text});
    React.findDOMNode(this.refs.author).value = '';
    React.findDOMNode(this.refs.text).value = '';
  },
  render: function() {
    return (
      <div className="panel panel-default">
        <div className="panel-heading">Add a Note</div>
        <div className="panel-body">
          <form className="commentForm" onSubmit={this.handleSubmit}>
            <div className="form-group">
              <label className="control-label">Author</label>
              <input idName="authorInput" className="form-control" type="text" placeholder="Your name" ref="author" />
            </div>
            <div className="form-group">
              <label className="control-label">Author</label>
              <textarea className="form-control" id="commentInput" rows="3" placeholder="Say something..." ref="text"></textarea>
            </div>
            <input type="submit" className="btn btn-primary" value="Post" />
          </form>
        </div>
      </div>
    );
  }
});

$(function() {
  var $content = $("#content");
  if ($content.length > 0) {
    React.render(
      <CommentBox url="comments.json" pollInterval={2000} />,
      document.getElementById('content')
    );
  }
});

$(document).on("page:change", function() {
  var $content = $("#content");
  if ($content.length > 0) {
    React.render(
      <CommentBox url="comments.json" pollInterval={2000} />,
      document.getElementById('content')
    );
  }
});
