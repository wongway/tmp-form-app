import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  inputContainer: {
    padding: 5,
  },
  inputStyle: {
    borderColor: "black",
    borderWidth: 1,
    padding: 10,
    borderRadius: 2,
  },
  manageTeamWrapper: {
    width: 350,
  },
  manageTeamTitle: {
    marginBottom: 10,
  },
  addTeamMemberInput: {
    borderBottomColor: "black",
    borderBottomWidth: 1,
    marginTop: 5,
    fontSize: 18,
  },
  manageTeamButtonContainer: {
    textAlign: "left",
    borderTopColor: "grey",
    borderTopWidth: 1,
    borderBottomColor: "grey",
    borderBottomWidth: 1,
  },
  plusButton: {
    fontSize: 28,
    fontWeight: "400",
  },
  fixToText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  titleText: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 10,
    marginHorizontal: 20,
  },
  h2Text: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
    marginHorizontal: 20,
  },
  normalBlockText : {
    marginVertical: 10,
    marginHorizontal: 20,
  },
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    button: {
        aspectRatio: 1,
        borderRadius: 10,
        width: '90%',
        // marginHorizontal: 16
        // height: 50,
        // marginVertical: 10,
    },
    tile: {
        flex: 1,    
        marginHorizontal: 10,
        width: '45%',
    },
    tileImage: {
        aspectRatio: 1,
        borderRadius: 10,
        marginVertical: 10,
    },
    tileContent: {
        height: 100,
        width: "50%",
        backgroundColor: "#ccc",
    },
    duration: {
        fontWeight: "bold"
    },
    placeholder: {
        backgroundColor: "#ccc",
        // width: 100,
        // height: 100,
    },
    workoutTile: {
        // backgroundColor: "#ccc",
        width: '50%',
        alignItems: 'center',
        marginVertical: 5,
    },
    workoutFav: {
        margin: "5%",
        color: "#e31b23",
        fontSize: 18,
    },
    workoutDetailTitle: {
        marginTop: 10,
        marginLeft: 10,
        fontSize: 20,
        fontWeight: "bold", 
        color: "white",
    },
    bottom: {
        flex: 1,
        justifyContent: "flex-end",
        marginBottom: 20,
    },
});

export default styles;