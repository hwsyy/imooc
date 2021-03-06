// detail page
var Movie = require('../models/movie');
var Comment = require('../models/comment');
var Category = require('../models/category')
var _ = require('underscore');

exports.detail = function(req,res){
    var id = req.params.id;
    Movie.findById(id,function(err,movie){
        Comment
            .find({movie:id})
            // populate()根据from的objectId拿到user.name
            .populate('from','name')
            .populate('reply.from reply.to','name')
            .exec(function(err,comments){
                console.log(comments)
                res.render('detail',{
                    title:movie.title,
                    movie:movie,
                    comments:comments
                })
            })
    });
}

// admin add movie page
exports.add = function(req,res){
    Category.find({},function(err,categories){
        res.render('movie-add',{
            title:'后台录入页',
            movie:{},
            categories:categories
        })
    })
}

// admin movie list page
exports.list = function(req,res){
    Movie.fetch(function(err,movies){
        if(err){
            console.log(err)
        }
        res.render('movie-list',{
            title:'后台电影列表页',
            movies:movies
        })
    });
}

//admin movie update page
exports.update = function(req,res){
    var id = req.params.id;

    if(id){
        Movie.findById(id,function(err,movie){
            Category.find({},function(err,categories){
                res.render('movie-add',{
                    title:'后台电影更新页',
                    movie:movie,
                    categories:categories
                })
            })
        })
    }
}

// amdin movie post
exports.save = function(req,res){
    var id = req.body.movie._id;
    var movieObj = req.body.movie;
    var _movie;

    if(id){
        Movie.findById(id,function(err,movie){
            if(err){
                console.log(err)
            }
            _movie = _.extend(movie,movieObj);
            _movie.save(function(err,movie){
                if(err){
                    console.log(err)
                }
                res.redirect('/movie/'+movie._id)
            })
        })
    }else{
        _movie = new Movie(movieObj)

        var categoryId = movieObj.category
        var categoryName  = movieObj.categoryName 

        _movie.save(function(err,movie){
            if(err){
                console.log(err)
            }

            Category.findById(categoryId,function(err,category){
                category.movies.push(movie._id)
                category.save(function(err,category){
                    res.redirect('/movie/' + movie._id)
                })
            })
        })
    }
}

// movielist delete 
exports.del = function(req,res){
    var id = req.query.id
    if(id){
        Movie.remove({_id:id},function(err,movie){
            if(err){
                console.log(err)
            }
            res.json({success:1});
        })
    }
}
