import { useMutation } from "@apollo/client";
import { cacheSlot } from "@apollo/client/cache";
import { faBookmark, faComment, faHeart, faPaperPlane } from "@fortawesome/free-regular-svg-icons";
import {faHeart as SolidHeart} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import gql from "graphql-tag";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { logUserOut } from "../../apollo";
import { Avatar } from "../Avatar";
import { FatText } from "../shared";
import {Comments} from "./Comments";

const TOGGLE_LIKE_MUTATION = gql`
    mutation toggleLine($id:Int!){
        toggleLike(id:$id){
            ok
            error
        }
    }
`


const PhotoContainer = styled.div`
    background-color: white;
    border:1px solid ${(props) => props.theme.borderColor};
    margin-bottom: 20px;
    max-width: 615px;
    border-radius : 10px;
`

const PhotoHeader = styled.div`
    padding: 15px;
    display:flex;
    align-items: center;
`

const Username = styled(FatText)`
    margin-left:10px;
`

const PhotoFile = styled.img`
    width: 615px;
`
const PhotoData = styled.div`

`

const PhotoActions = styled.div`
    cursor: pointer;
    display:flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px;
    div{
        display:flex;
        align-items:center;
    }

`

const PhotoAction = styled.div`
    margin-right: 10px;
`

const Likes = styled(FatText)`
    display : block;
    padding : 15px;
`



export const Photo = ({
    id,
    user,
    file,
    isLiked,
    likes,
    caption,
    comments,
    totalComments}) => {
        const updateToggleLike = (cache, result) => {
            const{
                data:{
                    toggleLike:{ok},
                }
            } = result;
            if(ok){
                const photoId = `Photo:${id}`;
                cache.modify({
                    id : photoId,
                    fields:{
                        isLiked(prev){
                            return !prev;
                        },
                        likes(prev){
                            if(isLiked){
                                return prev - 1;
                            }
                            return prev + 1; 
                        }
                    }
                })
            }
        }
    const [toggleLikeMutation, { loading }] = useMutation(
        TOGGLE_LIKE_MUTATION,
        { variables: { id },
        update: updateToggleLike }
    );

    return(
        <PhotoContainer key={id}>
            <PhotoHeader>
                <Link to={`/users/${user.username}`}>
                    <Avatar url={user.avatar} lg/>
                </Link>

                <Link to={`/users/${user.username}`}>
                    <Username>{user.username}</Username>
                </Link>
            </PhotoHeader>
                <PhotoFile src={file} />
                <PhotoData>
                    <PhotoActions>
                        <div>
                            <PhotoAction onClick={toggleLikeMutation}><FontAwesomeIcon style={{color: (isLiked? "tomato":"inherit")}} size={"2x"}icon={isLiked ? SolidHeart : faHeart}/></PhotoAction>
                            <PhotoAction><FontAwesomeIcon size={"2x"}icon={faComment}/></PhotoAction>
                            <PhotoAction><FontAwesomeIcon size={"2x"}icon={faPaperPlane}/></PhotoAction>
                        </div>
                        <div>

                        </div>
                        <FontAwesomeIcon size={"2x"} icon={faBookmark}/>
                    </PhotoActions>
                    <Likes>{likes === 1? "1 like" : `${likes} likes`}</Likes>
                    <Comments photoId={id} author={user.username} caption={caption} comments={comments} totalComments={totalComments}/>
                </PhotoData>
        </PhotoContainer>
        )
}

Photo.propTypes = {
    id:PropTypes.number.isRequired,
    user:PropTypes.shape({
        avatar:PropTypes.string.isRequired,
        username:PropTypes.string.isRequired
    }),
    file:PropTypes.string.isRequired,
    isLiked:PropTypes.bool.isRequired,
    likes:PropTypes.number.isRequired,
    caption:PropTypes.string,
    totalComments:PropTypes.number.isRequired,
    comments: PropTypes.arrayOf(PropTypes.shape({
        id:PropTypes.number.isRequired,
        user:PropTypes.shape({
            avatar:PropTypes.string.isRequired,
            username:PropTypes.string.isRequired,
        }),
        payload:PropTypes.string.isRequired,
        isMine:PropTypes.bool.isRequired,
        createdAt:PropTypes.string.isRequired,
    }))
}