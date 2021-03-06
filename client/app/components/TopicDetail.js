import React from 'react';
import 'highlight.js/styles/github-gist.css';
import {getTopicDetail, addComment, delComment, delTopic} from '../lib/client';
import {renderMarkdown,redirectURL} from '../lib/utils';
import CommentEditor from './CommentEditor';

export default class TopicDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state={
      topic:null
    };
  }

  componentDidMount() {
    this.refresh();
  }

  refresh() {
    getTopicDetail(this.props.params.id)
      .then(topic => {
        topic.html = renderMarkdown(topic.content);
        if (topic.comments) {
          for (const item of topic.comments) {
            item.html = renderMarkdown(item.content);
          }
        }
        this.setState({topic: topic})
      })
      .catch(err => console.error(err));
  }

  toEdit() {
    redirectURL(`/edit/${this.props.params.id}`);
  }

  del() {
    if(!confirm('是否删除文章')) return;
    delTopic(this.state.topic._id)
      .then(() => {
        redirectURL('/');
      })
      .catch(err => {
        console.log(err);
      })
  }

  handleDelComment(cid) {
    if(!confirm('是否删除评论')) return;
    delComment(this.state.topic._id, cid)
      .then(comment => {
        this.refresh();
      })
      .catch(err => {
        console.log(err);
      })
  }

  render() {
    const topic = this.state.topic;
    if (!topic) {
      return <div>正在加载...</div>
    }
    return (
      <div>
        {
          topic.permission.edit ?
          <button type="button" className="btn btn-primary" onClick={this.toEdit.bind(this)}>
            <i className="glyphicon glyphicon-edit"></i>编辑
          </button>:null
        }
        &nbsp;
        {
          topic.permission.delete ?
          <button type="button" className="btn btn-danger" onClick={this.del.bind(this)}>
            <i className="glyphicon glyphicon-trash"></i>删除
          </button> : null
        }
        <h2>{topic.title}</h2>
        <p style={{color:'gray'}}>{topic.author.nickname} 发表于 {topic.createdAt}</p>
        <p style={{color:'gray'}}>{"标签：" + topic.tags}</p>
        <hr />
        <section dangerouslySetInnerHTML={{__html:topic.html}} />
        <CommentEditor
          title="发表评论"
          onSave={(comment, done) => {
            addComment(this.state.topic._id,{content: comment.content})
              .then(comment => {
                done();
                this.refresh();
              })
              .catch(err => {
                done();
                console.log(err);
              });
          }}
           />
        <ul className="list-group">
          {
            topic.comments.map((item, i) => {
              return (
                <li className="list-group-item" key={i}>
                  <span className="pull-right">
                    {
                      item.permission.delete ?
                      <button className="btn btn-xs btn-danger" onClick={this.handleDelComment.bind(this, item._id)}>
                        <i className="glyphicon glyphicon-trash"></i>
                      </button>:null
                    }
                  </span>
                  {item.author.nickname}于{item.createdAt}说：<br/>
                <p dangerouslySetInnerHTML={{__html: item.html}} ></p>
                </li>
              )
            })
          }
        </ul>
      </div>
    );
  }
}
