import { useEffect, useState } from "react";
import { useGlobalContext } from "../../context/GlobalContext";
import { iRegisterMusician } from "../../services/RegisterMusician";
import { ModalCard } from "../../components/ModalCard";
import { Modal } from "../../components/Modal";
import { api } from "../../services/ApiRequest";
import { Card } from "../../components/Card";
import { toast } from "react-toastify";
import { NavDashBoard } from "../../components/NavDashBoard";
import * as styled from "./style";
import { ModalRemove } from "../../components/ModalRemove";
import { useNavigate } from "react-router-dom";
import { ModalUpdateBand } from "../../components/ModalUpdateBand";
import imgDefault from "../../assets/default.jpg";
import noResults from "../../assets/NoResults.png";
import { DeclineAnInvitationMusician } from "../../services/DeleteInvite";
import { AiOutlineCloseCircle } from "react-icons/ai";
import { BiNotificationOff } from "react-icons/bi";

export const DashboardBand = () => {
  const {
    user,
    setUser,
    setOpenModal,
    setOpenModalRemove,
    openModal,
    openModalRemove,
    setOpenModalUpdateM,
    setOpenModalUpdateB,
    filteredMusicians,
    setFilteredMusicians,
    openModalUpdateB,
    openModalNotification,
    updateNotification,
    setUpdateNotification
  } = useGlobalContext();
  const [musicians, setMusicians] = useState([] as iRegisterMusician[]);
  const [cardMusician, setCardMusicians] = useState<any>(null);
  const [loadingPageMusician, setLoadingPageMusician] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function getMusicians() {
      try {
        const { data } = await api.get<iRegisterMusician[]>(
          "/users?type=musico"
        );
        setMusicians(data);
        setFilteredMusicians(data);
        setLoadingPageMusician(false);
      } catch (error) {
        console.log(error);
      }
    }
    getMusicians();
  }, []);

  async function getCardProps(idMusician: number) {
    try {
      const { data } = await api.get<iRegisterMusician>(`/users/${idMusician}`);
      setCardMusicians(data);
      setOpenModal(true);
    } catch (error) {
      console.log(error);
    }
  }

  const invite = async () => {
    const info = {
      userId: cardMusician.id,
      bio: user?.bio,
      state: user?.state,
      social_media: user?.social_media,
      genre: user?.genre,
      image: user?.image,
      name: user?.name,
    };

    try {
      if (
        user?.bio !== "" ||
        user?.genre !== "" ||
        user?.image !== "" ||
        user?.requirement !== "" ||
        user?.social_media !== "" ||
        user?.state !== ""
      ) {
        await api.post("/bands_invites", info);
        toast.success("Convite enviado");
        setOpenModal(false);
      } else {
        toast.warning("Para convidar um músico complete seu cadastro!");
        setOpenModal(false);
        setOpenModalUpdateB(true);
      }
    } catch (error) {
      toast.error("Ops... tente novamente!");
      console.log(error);
    }
  };
console.log(user)
  const remove = async (idUser: number): Promise<void> => {
    try {
      await api.delete(`/users/${idUser}`);
      toast.success("Cadastro removido!");
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      console.log(error);
    }
  };
  console.log(user)

  return (
    <div>
      {openModalUpdateB && (
        <Modal
          setOpenModal={setOpenModal}
          setOpenModalRemove={setOpenModalRemove}
          setOpenModalUpdateM={setOpenModalUpdateM}
          setOpenModalUpdateB={setOpenModalUpdateB}
        >
          <ModalUpdateBand setUser={setUser} />
        </Modal>
      )}

      {openModalRemove && (
        <Modal
          setOpenModal={setOpenModal}
          setOpenModalRemove={setOpenModalRemove}
          setOpenModalUpdateM={setOpenModalUpdateM}
          setOpenModalUpdateB={setOpenModalUpdateB}
        >
          <ModalRemove
            image={user?.image}
            name={user?.name}
            id={user?.id}
            remove={remove}
          />
        </Modal>
      )}
      {openModal && (
        <Modal
          setOpenModal={setOpenModal}
          setOpenModalRemove={setOpenModalRemove}
          setOpenModalUpdateM={setOpenModalUpdateM}
          setOpenModalUpdateB={setOpenModalUpdateB}
        >
          <ModalCard
            imageProfile={
              cardMusician?.image ? cardMusician?.image : imgDefault
            }
            name={cardMusician.username}
            email={cardMusician.email}
            bio={cardMusician.bio}
            type={cardMusician.type}
            invite={invite}
          ></ModalCard>
        </Modal>
      )}
      {
        openModalNotification 
        ? 
        ( 
        <styled.DivNotifications>
                    {user?.members_invites?.length?
           (
            user?.members_invites?.map( invite => (

              <styled.CardNotifications>
                <figure>
                  <img src={invite.image} alt="" />
                </figure>
                <div>
                  <div>
                    <h2>{invite.name}</h2>
                    <p>{invite.skill} Rock</p>
                  </div>
                  <button onClick={async () => await DeclineAnInvitationMusician(invite.id,setUpdateNotification) }><AiOutlineCloseCircle/></button>
                </div>
              </styled.CardNotifications>
            )
          
          ))
           : 
           (<styled.CardNotifications>
            <section>
              <BiNotificationOff/>
              <p>Você não possui nenhuma notificação</p>
            </section>
          </styled.CardNotifications>)}



          {/* {user?.members_invites?.map( invite => (

            <styled.CardNotifications>
              <figure>
                <img src={invite.image} alt="" />
              </figure>
              <div>
                <div>
                  <h2>{invite.name}</h2>
                  <p>{invite.skill} Rock</p>
                </div>
                <button onClick={async () => await DeclineAnInvitationMusician(invite.id,setUpdateNotification) }><AiOutlineCloseCircle/></button>
              </div>
            </styled.CardNotifications>
          )
        
        )} */}
        </styled.DivNotifications>
        ) : 
        (<p></p>)

      }
      <NavDashBoard
        image={user?.image ? user?.image : imgDefault}
        musicians={musicians}
      >
        <styled.ContainerUl>
          {filteredMusicians?.length === 0 && loadingPageMusician === false ? (
            <ul>
              <div className="noResults">
                <img src={noResults} alt="Não há resultados" />
                <p>Nenhuma correspondência para sua pesquisa.</p>
              </div>
            </ul>
          ) : (
            <ul>
              {filteredMusicians &&
                filteredMusicians?.map((filteredMusician) => (
                  <Card
                    id={filteredMusician.id}
                    getCardProps={getCardProps}
                    key={filteredMusician.id}
                    name={filteredMusician.name}
                    image={
                      filteredMusician?.image
                        ? filteredMusician?.image
                        : imgDefault
                    }
                    type="musico"
                    state={filteredMusician.state}
                    skill={filteredMusician.skill}
                  />
                ))}
            </ul>
          )}
        </styled.ContainerUl>
      </NavDashBoard>
    </div>
  );
};
